"""Validate daily wellness data and emit a JARVIS dashboard snapshot.

Raw health data is read locally and never transmitted by this script. The default
model ladder is deliberately transparent. TensorFlow is an optional challenger,
not an automatic upgrade.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import statistics
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class MetricSpec:
    source: str
    label: str
    unit: str
    goal: tuple[float, float]
    higher_is_better: bool
    plausible: tuple[float, float]


SPECS = {
    "sleep": MetricSpec("sleep_hours", "Sleep", "h", (7.5, 8.5), True, (0, 18)),
    "hrv": MetricSpec("hrv_ms", "HRV", "ms", (35, 70), True, (1, 300)),
    "restingHr": MetricSpec("resting_hr_bpm", "Resting HR", "bpm", (50, 70), False, (25, 180)),
    "vo2max": MetricSpec("vo2max", "VO2 max", "ml/kg/min", (42, 50), True, (8, 100)),
    "steps": MetricSpec("steps", "Steps", "/day", (8000, 11000), True, (0, 100000)),
    "exercise": MetricSpec("exercise_minutes", "Exercise", "min", (30, 60), True, (0, 1440)),
    "spo2Low": MetricSpec("spo2_low", "SpO2 low", "%", (95, 100), True, (50, 100)),
}


def parse_number(raw: str | None) -> float | None:
    if raw is None or not raw.strip():
        return None
    value = float(raw)
    if not math.isfinite(value):
        raise ValueError(f"Non-finite numeric value: {raw}")
    return value


def load_rows(path: Path) -> list[dict[str, object]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"date", *(spec.source for spec in SPECS.values())}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"CSV is missing columns: {', '.join(sorted(missing))}")
        rows: list[dict[str, object]] = []
        seen: set[date] = set()
        for line_number, raw in enumerate(reader, start=2):
            try:
                observed = date.fromisoformat((raw.get("date") or "").strip())
            except ValueError as exc:
                raise ValueError(f"Line {line_number}: date must use YYYY-MM-DD") from exc
            if observed in seen:
                raise ValueError(f"Duplicate date: {observed.isoformat()}")
            seen.add(observed)
            row: dict[str, object] = {"date": observed}
            for spec in SPECS.values():
                value = parse_number(raw.get(spec.source))
                if value is not None and not spec.plausible[0] <= value <= spec.plausible[1]:
                    raise ValueError(
                        f"Line {line_number}: {spec.source}={value} is outside the "
                        f"plausibility range {spec.plausible}"
                    )
                row[spec.source] = value
            rows.append(row)
    if not rows:
        raise ValueError("CSV contains no data rows")
    rows.sort(key=lambda item: item["date"])
    return rows


def values(rows: Iterable[dict[str, object]], column: str) -> list[float]:
    return [float(row[column]) for row in rows if row.get(column) is not None]


def recent_values(rows: list[dict[str, object]], column: str, days: int) -> list[float]:
    return values(rows[-days:], column)


def mean_or(values_: list[float], fallback: float) -> float:
    return statistics.fmean(values_) if values_ else fallback


def linear_next(series: list[float], window: int = 30) -> float:
    sample = series[-window:]
    if len(sample) < 3:
        return sample[-1]
    xs = list(range(len(sample)))
    x_bar = statistics.fmean(xs)
    y_bar = statistics.fmean(sample)
    denominator = sum((x - x_bar) ** 2 for x in xs)
    slope = sum((x - x_bar) * (y - y_bar) for x, y in zip(xs, sample)) / denominator
    return y_bar + slope * (len(sample) - x_bar)


def rolling_backtest(series: list[float], min_train: int = 30) -> dict[str, object]:
    if len(series) <= min_train:
        return {"winner": "insufficient_data", "observations": len(series), "rmse": {}}
    errors: dict[str, list[float]] = {"persistence": [], "linear_trend": []}
    for index in range(min_train, len(series)):
        train = series[:index]
        actual = series[index]
        predictions = {
            "persistence": train[-1],
            "linear_trend": linear_next(train),
        }
        for name, prediction in predictions.items():
            errors[name].append((prediction - actual) ** 2)
    rmse = {name: math.sqrt(statistics.fmean(squared)) for name, squared in errors.items()}
    winner = min(rmse, key=rmse.get)
    return {
        "winner": winner,
        "observations": len(series),
        "holdoutPredictions": len(errors[winner]),
        "rmse": {name: round(score, 4) for name, score in rmse.items()},
    }


def tensorflow_challenger(series: list[float]) -> dict[str, object]:
    if len(series) < 180:
        return {"status": "ineligible", "reason": "requires at least 180 observations"}
    try:
        import numpy as np
        import tensorflow as tf
    except ImportError:
        return {"status": "unavailable", "reason": "install analytics/requirements-ml.txt"}

    tf.keras.utils.set_random_seed(1907)
    array = np.asarray(series, dtype="float32")
    mean = float(array.mean())
    std = float(array.std()) or 1.0
    scaled = (array - mean) / std
    lookback = 14
    features = np.asarray([scaled[i - lookback : i] for i in range(lookback, len(scaled))])
    labels = np.asarray([scaled[i] for i in range(lookback, len(scaled))])
    split = int(len(features) * 0.8)
    x_train, x_test = features[:split], features[split:]
    y_train, y_test = labels[:split], labels[split:]
    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input((lookback,)),
            tf.keras.layers.Dense(16, activation="relu"),
            tf.keras.layers.Dropout(0.15),
            tf.keras.layers.Dense(8, activation="relu"),
            tf.keras.layers.Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mse")
    model.fit(
        x_train,
        y_train,
        validation_split=0.2,
        epochs=120,
        batch_size=16,
        verbose=0,
        callbacks=[tf.keras.callbacks.EarlyStopping(patience=12, restore_best_weights=True)],
    )
    prediction = model.predict(x_test, verbose=0).reshape(-1) * std + mean
    actual = y_test * std + mean
    ml_rmse = float(np.sqrt(np.mean((prediction - actual) ** 2)))
    persistence = array[lookback + split - 1 : -1]
    baseline_rmse = float(np.sqrt(np.mean((persistence - actual) ** 2)))
    improvement = (baseline_rmse - ml_rmse) / max(baseline_rmse, 1e-9)
    return {
        "status": "eligible" if improvement >= 0.05 else "rejected",
        "criterion": "at least 5% RMSE improvement over persistence",
        "mlRmse": round(ml_rmse, 4),
        "persistenceRmse": round(baseline_rmse, 4),
        "relativeImprovement": round(improvement, 4),
    }


def build_snapshot(rows: list[dict[str, object]], profile: str, enable_tensorflow: bool) -> dict[str, object]:
    metrics: dict[str, object] = {}
    model_cards: dict[str, object] = {}
    for key, spec in SPECS.items():
        all_values = values(rows, spec.source)
        if not all_values:
            raise ValueError(f"No observations found for required metric: {spec.source}")
        last = all_values[-1]
        seven = recent_values(rows, spec.source, 7)
        ninety = recent_values(rows, spec.source, 90)
        metrics[key] = {
            "label": spec.label,
            "value": round(last, 2),
            "unit": spec.unit,
            "sevenDay": round(mean_or(seven, last), 2),
            "ninetyDay": round(mean_or(ninety, last), 2),
            "goal": list(spec.goal),
            "higherIsBetter": spec.higher_is_better,
            "coverageDays": len(ninety),
        }
        model_card = {"transparent": rolling_backtest(all_values)}
        if enable_tensorflow:
            model_card["tensorflow"] = tensorflow_challenger(all_values)
        model_cards[key] = model_card

    as_of = rows[-1]["date"]
    assert isinstance(as_of, date)
    return {
        "profile": profile,
        "asOf": datetime.combine(as_of, datetime.max.time()).isoformat(),
        "source": "imported",
        "metrics": metrics,
        "modelCard": {
            "generatedAt": datetime.now().astimezone().isoformat(),
            "policy": "TensorFlow must beat persistence by at least 5% RMSE on a chronological holdout.",
            "metrics": model_cards,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--profile", default="Private profile")
    parser.add_argument("--enable-tensorflow", action="store_true")
    args = parser.parse_args()
    snapshot = build_snapshot(load_rows(args.csv_path), args.profile, args.enable_tensorflow)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
    print(f"Wrote validated snapshot to {args.output}")


if __name__ == "__main__":
    main()

