import tempfile
import unittest
from pathlib import Path

from jarvis_pipeline import build_snapshot, linear_next, load_rows, rolling_backtest


class PipelineTests(unittest.TestCase):
    def test_linear_next_tracks_simple_trend(self):
        self.assertAlmostEqual(linear_next([1, 2, 3, 4]), 5.0)

    def test_backtest_returns_a_supported_winner(self):
        result = rolling_backtest([float(value) for value in range(45)])
        self.assertIn(result["winner"], {"persistence", "linear_trend"})

    def test_csv_builds_dashboard_contract(self):
        header = "date,sleep_hours,hrv_ms,resting_hr_bpm,vo2max,steps,exercise_minutes,spo2_low\n"
        rows = "".join(
            f"2026-07-{day:02d},{6 + day / 100},{38 + day / 10},{72 - day / 20},{33 + day / 100},{7000 + day * 20},30,95\n"
            for day in range(1, 29)
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "health.csv"
            path.write_text(header + rows, encoding="utf-8")
            snapshot = build_snapshot(load_rows(path), "Test", False)
        self.assertEqual(snapshot["profile"], "Test")
        self.assertEqual(set(snapshot["metrics"]), {"sleep", "hrv", "restingHr", "vo2max", "steps", "exercise", "spo2Low"})
        self.assertEqual(snapshot["metrics"]["sleep"]["coverageDays"], 28)


if __name__ == "__main__":
    unittest.main()
