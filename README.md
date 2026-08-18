# JARVIS Health

JARVIS Health is Pinak Bhuban's personal health/performance system. The repository now contains two complementary layers:

1. **Production ChatGPT automations** — the current JARVIS AM and JARVIS PM newsletter definitions, plus the PM delivery guard.
2. **Analytics/dashboard code** — the local JARVIS health dashboard and Python snapshot pipeline used for quantitative analysis and experimentation.

## Production automations

The current automation definitions live under [`automations/`](automations/):

- `jarvis-am.md` — morning health/performance newsletter specification.
- `jarvis-pm.md` — nightly newsletter specification, including the required `TODAY'S WINS // WHAT CHANGES TOMORROW` closeout.
- `jarvis-pm-delivery-guard.md` — fail-safe that checks for a missed PM delivery and sends it only when absent.

These files document the current production behavior. The actual schedules execute as ChatGPT scheduled tasks and use connected Health/Apple Health data plus Gmail at runtime.

**Do not commit private health exports, Gmail content, credentials, or personalized snapshots to this public repository.**

## Analytics dashboard

The dashboard remains a browser-local quantitative health control room. It provides KPI context, scenario analysis, uncertainty simulation, driver attribution, and local JSON import without sending imported data to a server.

### Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

### Build a personal snapshot

Prepare a local CSV using:

```text
date,sleep_hours,hrv_ms,resting_hr_bpm,vo2max,steps,exercise_minutes,spo2_low
```

Then run:

```powershell
python analytics/jarvis_pipeline.py data/private/health_daily.csv --output data/private/jarvis-snapshot.json
```

The pipeline validates dates, values, duplicate rows, metric coverage, rolling windows, and simple forecast baselines.

## TensorFlow challenger

TensorFlow is optional and must earn its place. It is evaluated only with at least 180 daily observations and must beat persistence on a chronological holdout before being marked eligible.

```powershell
python -m venv analytics/.venv
analytics/.venv/Scripts/pip install -r analytics/requirements-ml.txt
analytics/.venv/Scripts/python analytics/jarvis_pipeline.py data/private/health_daily.csv --output data/private/jarvis-snapshot.json --enable-tensorflow
```

## Repository hygiene

- `data/private/` and `data/imports/` are ignored.
- Raw Apple Health exports, lab reports, medical records, tokens, and personalized snapshots must remain outside source control.
- Starter/demo API examples that are not part of the JARVIS product are intentionally excluded.
- Optional hosting/database scaffolding is retained only where it remains coupled to the deployment/tooling configuration.

## Medical boundary

This is a wellness and performance planning tool, not a diagnostic device. Wearable measurements can be noisy. Repeated concerning oxygen, heart-rate, sleep, or symptom patterns should be reviewed with an appropriate clinician.
