# JARVIS Health Alpha

JARVIS Health Alpha is a quantitative personal-health control room. It turns wellness signals into a clear KPI stack, a constraint-first daily protocol, and transparent 30/90/180-day what-if scenarios.

The hosted interface is intentionally browser-local. It ships with fictional demo data and can import a personal snapshot without sending that file to a server. Raw health records should never be committed to this repository.

## What is included

- KPI signal stack for sleep, HRV, resting heart rate, VO2 max, steps, exercise, and low SpO2
- Rolling 7-day vs 90-day context and explicit performance ranges
- Downside, current-pattern, optimized, and custom scenario books
- Seeded 1,200-path uncertainty simulation for 30-, 90-, and 180-day outcomes
- Driver attribution, model-risk notes, data-coverage ledger, and daily protocol
- Local JSON import and scenario export
- Python pipeline for converting daily CSV exports into the dashboard snapshot contract
- Optional TensorFlow challenger that is gated by sample size and time-series backtesting

## Privacy model

The public application starts in demo mode. A selected JSON file is parsed in browser memory and is not transmitted or persisted. Private source data belongs in `data/private/` or `data/imports/`, which are excluded by `.gitignore`.

Do not put medical reports, Apple Health XML/CSV files, credentials, or personalized snapshots under `public/`.

## Run the dashboard

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build a personal snapshot

Prepare a daily CSV with this header:

```text
date,sleep_hours,hrv_ms,resting_hr_bpm,vo2max,steps,exercise_minutes,spo2_low
```

Then run:

```powershell
python analytics/jarvis_pipeline.py data/private/health_daily.csv --output data/private/jarvis-snapshot.json
```

Import the resulting JSON from the dashboard. The pipeline validates dates, values, duplicate rows, metric coverage, rolling windows, and simple forecast baselines.

## TensorFlow model gate

TensorFlow is a challenger, not a marketing label. It is disabled by default and is only evaluated with at least 180 daily observations. It must beat persistence on a chronological holdout before the pipeline marks it eligible.

```powershell
python -m venv analytics/.venv
analytics/.venv/Scripts/pip install -r analytics/requirements-ml.txt
analytics/.venv/Scripts/python analytics/jarvis_pipeline.py data/private/health_daily.csv --output data/private/jarvis-snapshot.json --enable-tensorflow
```

The model card is written into the output snapshot. The web simulator remains intentionally transparent because scenario sliders describe assumptions, not identified causal effects.

## Medical boundary

This is a wellness and performance planning tool, not a diagnostic device. Wearable measurements can be noisy. Repeated concerning oxygen, heart-rate, sleep, or symptom patterns should be reviewed with an appropriate clinician.

