# JARVIS Health

JARVIS Health is a personal-health control room with two connected layers:

1. **Production ChatGPT automations** that generate the daily JARVIS AM and PM health/performance emails from connected Health/Apple Health and Gmail data.
2. **Dashboard + analytics tooling** that turns wellness signals into KPI context, constraint-first planning, and transparent 30/90/180-day scenarios.

The current production automation definitions are versioned under [`automations/`](automations/README.md).

## Production automations

- `automations/jarvis-am.md` — daily morning health/performance intelligence email.
- `automations/jarvis-pm.md` — nightly closeout with evidence-backed wins and ranked changes for tomorrow.
- `automations/jarvis-pm-delivery-guard.md` — post-midnight fail-safe that checks Gmail and recovers a missed PM delivery.

The live schedules execute in ChatGPT. GitHub is the version-controlled reference for the prompt contract, analytical logic, supporting code, and change history.

The canonical visual template is the Gmail message with subject:

`JARVIS PM // SENSOR FUSION + SPC FORMAT V2 PREVIEW — Aug 10, 2026`

## Dashboard and analytics

The browser dashboard ships with fictional demo data and can import a personal snapshot without sending that file to a server. Raw health records should never be committed to this repository.

### Included

- KPI signal stack for sleep, HRV, resting heart rate, VO2 max, steps, exercise, and low SpO2
- Rolling 7-day vs 90-day context and explicit performance ranges
- Downside, current-pattern, optimized, and custom scenario books
- Seeded 1,200-path uncertainty simulation for 30-, 90-, and 180-day outcomes
- Driver attribution, model-risk notes, data-coverage ledger, and daily protocol
- Local JSON import and scenario export
- Python pipeline for converting daily CSV exports into the dashboard snapshot contract
- Optional TensorFlow challenger gated by sample size and time-series backtesting

## Privacy model

The public application starts in demo mode. A selected JSON file is parsed in browser memory and is not transmitted or persisted. Private source data belongs in `data/private/` or `data/imports/`, which are excluded by `.gitignore`.

Do not commit medical reports, Apple Health XML/CSV exports, credentials, personal Gmail content, or personalized snapshots to this repository.

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

## Repository cleanup policy

The old standalone `examples/d1` notes/database demo has been removed because it was unrelated to the active JARVIS application. Core dashboard, analytics, testing, deployment, privacy, and data-contract files are intentionally retained.

## Medical boundary

This is a wellness and performance planning tool, not a diagnostic device. Wearable measurements can be noisy. Repeated concerning oxygen, heart-rate, sleep, or symptom patterns should be reviewed with an appropriate clinician.
