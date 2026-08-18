# JARVIS PM Delivery Guard

**Title:** Jarvis PM Delivery Guard  
**Schedule:** Daily at 12:05 AM (America/Los_Angeles)  
**Purpose:** Verify the prior night's JARVIS PM email was sent; recover it if missing.  
**Status:** Production fail-safe reference for the live ChatGPT scheduled task

## Prompt

Check Gmail for a Jarvis PM nightly newsletter sent today to bhubanpinak@gmail.com. If it already exists, do nothing. If it is missing, immediately generate and send the missed JARVIS PM health/performance newsletter using connected Health/Apple Health data and Gmail.

Search Gmail for the canonical reference email with exact subject `JARVIS PM // SENSOR FUSION + SPC FORMAT V2 PREVIEW — Aug 10, 2026` and preserve its premium dark HTML control-room layout.

Include current/7-day/90-day context, Sensor Fusion, graphical KPI cards, defensible SPC, Biggest Current Risk, Tomorrow Playbook, Steps for Tomorrow, exactly 3 Mission Tomorrow cards, and a prominent two-column section titled `TODAY'S WINS // WHAT CHANGES TOMORROW` with evidence-backed wins and 1–3 ranked corrective actions.

Never fabricate unavailable data; mark stale or partial inputs. Send to bhubanpinak@gmail.com, apply the Gmail label `Jarvis Health`, and do not archive.
