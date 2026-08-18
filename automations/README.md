# JARVIS Automations

This directory versions the current production JARVIS scheduled-task definitions used by ChatGPT.

## Current production jobs

- `jarvis-am.md` — morning health/performance intelligence email.
- `jarvis-pm.md` — nightly health/performance closeout email with wins and next-day corrections.
- `jarvis-pm-delivery-guard.md` — post-midnight fail-safe that checks Gmail and recovers a missing PM delivery.

## Architecture

The live schedules execute in ChatGPT and use connected Health/Apple Health data plus Gmail. This repository is the version-controlled reference for the prompts, analytical contract, delivery format, and supporting dashboard/analytics code.

The canonical visual template is the Gmail message with subject:

`JARVIS PM // SENSOR FUSION + SPC FORMAT V2 PREVIEW — Aug 10, 2026`

Do not commit personal medical exports, Apple Health raw data, credentials, or generated personalized snapshots to this public repository.

## Change policy

When the live scheduled tasks are materially updated, update these files in the same change so GitHub remains aligned with production. Keep the AM and PM analytical contract consistent unless a difference is intentionally documented.
