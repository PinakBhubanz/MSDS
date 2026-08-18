# JARVIS PM — Current Production Automation

**Title:** JARVIS PM  
**Schedule:** Daily at 11:50 PM (America/Los_Angeles)  
**Delivery:** Gmail → bhubanpinak@gmail.com  
**Status:** Production reference for the live ChatGPT scheduled task

## Prompt

Send Pinak Bhuban his DAILY JARVIS PM health/performance newsletter to bhubanpinak@gmail.com at the scheduled time, using connected Health/Apple Health data and Gmail.

### IMMUTABLE CANONICAL TEMPLATE — DO NOT DRIFT
Before composing EVERY run, search Gmail for the exact canonical reference email with subject:
`JARVIS PM // SENSOR FUSION + SPC FORMAT V2 PREVIEW — Aug 10, 2026`
Read that message, including its raw HTML/MIME if available. Treat its HTML layout, dimensions, hierarchy, card spacing, typography, borders, color system, KPI grid, Sensor Fusion matrix, SPC module structure, risk card, playbook cards, chronological action cards, and mission cards as the MASTER TEMPLATE.

The nightly newsletter must be the SAME visual product. Adapt only the data and NIGHTLY/TOMORROW wording. Do not redesign, simplify, flatten, or substitute another layout.

### HARD DELIVERY FORMAT CONTRACT
- Send with Gmail raw HTML via html_body / text-html capable sending, not Markdown as the primary presentation.
- Dark full email canvas and premium control-room HTML are mandatory.
- Max content width ~960px, centered, with generous outer padding and rounded cards matching the canonical Aug 10 V2 email.
- Preserve the canonical card hierarchy and visual density.
- Preserve the 3-column KPI card grid on desktop with mobile-safe behavior.
- Preserve the non-interactive CONTROL ROOM INDEX strip.
- Preserve dark navy/charcoal panels, cyan/electric blue data accents, cool-white text, restrained gold/green goal markers, red only for genuine alerts, thin blue-gray borders/gridlines, rounded corners and subtle premium spacing.
- Never send a plain-text-looking newsletter, Markdown-looking newsletter, giant text dump, or bare list as the normal result.
- Never replace the main layout with Unicode sparklines or prose-only sections.
- If the canonical HTML cannot be rendered faithfully in a run, DO NOT silently fall back to plain text. Instead send a short clearly labeled `JARVIS FORMAT ERROR` message stating that the premium template could not be rendered, and do not pretend the newsletter succeeded.

### CONTENT LOGIC — KEEP ALL CURRENT CAPABILITIES
Use the latest Health data and retain all previously approved analytical logic: Daily/7-day/90-day context, sensor fusion, whole-body load, recovery, cardio, locomotion, vertical load, energy, body composition/weight freshness, glucose freshness, SPC, predictive intelligence, Biggest Current Risk, Tomorrow Playbook, Steps for Tomorrow, Strength/315 Bench, Nutrition data-gap handling, and exactly 3 Mission Tomorrow priorities.

### DATA PROVENANCE
At top show latest Health coverage timestamp/date and mark current day PARTIAL when incomplete. Never fabricate a sync timestamp.

### SENSOR FUSION // WHOLE-BODY LOAD — REQUIRED
Use graphical cards/matrix covering available useful metrics together:
- RECOVERY: sleep, HRV, resting HR, respiratory rate, SpO2.
- CARDIO: VO2 max, walking HR, workout HR context if available.
- LOCOMOTION: steps, distance, walking speed, walking step length, gait metrics when useful.
- VERTICAL/INCLINE: flights climbed, stair ascent/descent speed, actual elevation/incline only if directly synced; otherwise show INCLINE DATA GAP and use vertical-load proxy.
- ENERGY: active energy + measured basal/resting energy.
- BODY: weight, body fat, lean mass, waist with measurement date/freshness.
- GLUCOSE: blood glucose/CGM with freshness; if stale show last-known baseline but exclude from current risk/load scoring.

Issue one integrated verdict: EXTERNAL LOAD vs RECOVERY CAPACITY relative to personal 30/90-day baseline when possible. Do not double-count calories. Use active energy as active-output metric; basal energy as resting expenditure; steps/flights/workouts explain load.

### KPI PRESENTATION
Use the canonical compact graphical KPI cards, not paragraphs. Put the number first, context second. Use labels such as CURRENT / 7D / 90D / TREND / STATUS / CONFIDENCE.

### SPC DEEP DIVE — VISUAL LOCK
For 2–3 highest-value metrics, use the same large engineering-style modules seen in the canonical email and approved screenshots.

Each module contains:
1. INDIVIDUALS (X) CONTROL CHART — chronological x-axis, readable y-axis, cyan points, red dashed UCL/LCL, subtle CL, translucent green/gold goal band, highlighted latest point.
2. MOVING RANGE (MR) CHART — aligned width, visible bars/points, MRbar, MR UCL, MR LCL=0, one concise interpretation.
3. DISTRIBUTION — for n<30 use canonical horizontal frequency-band bars with aligned bins/counts; for n>=30 use a histogram with optional subtle normal reference only when defensible.
4. INTERPRETATION STRIP — PROCESS STATE • SPEC STATE • latest vs center • one takeaway.

Use correct X-MR math: CL personal rolling mean; MR_i=|Xi-Xi-1|; sigma≈MRbar/1.128 where appropriate; X UCL/LCL≈Xbar±2.66MRbar; MR UCL≈3.267MRbar; LCL=0. Separate control limits from goal/spec limits. Remaining metrics may use compact SPC status chips/cards, not full modules.

### WORD DENSITY
Keep analytical depth but visually compress it. No prose paragraph >~55 words. Most cards 1–3 short lines. Executive summary max 4 bullets + one verdict. Avoid repeating the same number in multiple prose sections.

### BIGGEST CURRENT RISK
Exactly one major visual alert card with: risk title, 3–4 evidence chips, likelihood, impact, confidence, highest-leverage fix, what not to do tomorrow, and compact 30/90/180-day consequence row. Do not diagnose disease from wearables.

### TOMORROW PLAYBOOK — FUNCTIONAL CARDS
Keep distinct short cards for TRAINING, WALK/GAIT, BREATHING, POSTERIOR CHAIN, FASCIA/TENDON/ELASTICITY, and RECOVERY. Give concrete actions tied to actual data. Use ribcage-over-pelvis, relaxed arms, tripod foot, quiet landing, no overstride, hip extension; nasal breathing when comfortable; posterior-chain hinges/glutes/hamstrings/calves/lats/erectors; practical tendon/fascial loading, not pseudoscience. Avoid prescribing every recovery modality daily.

### STEPS FOR TOMORROW
Use five chronological visual cards: MORNING • MIDDAY • TRAINING • EVENING • BEFORE BED. Each = ACTION + TARGET + WHY in ~2 short lines.

### PREDICTIVE INTELLIGENCE
Keep 7/30/90-day windows, transparent baseline models, Monte Carlo/residual bootstrap only when supportable, 30/90/180 forecasts, P10–P90 ranges, current-pattern vs corrective-action scenarios, and validation/backtesting. Keep it visually compact. Never claim TensorFlow unless actually executed and validated better than simpler baselines.

### STRENGTH / 315 BENCH
Only use actual bench load/reps. If absent, show BENCH DATA GAP as a small canonical-style card.

### NUTRITION
Never invent intake. If unavailable show NUTRITION DATA GAP in a small card. Targets may be suggested from measured load/energy context but not misrepresented as actual intake.

### MISSION TOMORROW
Exactly 3 canonical-style mission cards: ACTION • TARGET • WHY NOW • SUCCESS SIGNAL.

### GMAIL FILING
After sending, apply the existing Gmail label `Jarvis Health`. Do not archive unless explicitly requested.

### QUALITY GATE BEFORE SEND
Compare the draft structurally against the canonical Aug 10 V2 email. Confirm all are true: dark premium HTML shell; header control-room card; CONTROL ROOM INDEX; executive verdict card; graphical KPI grid; Sensor Fusion matrix; real full SPC chart modules; Biggest Risk card; functional playbook cards; chronological Steps cards; 3 Mission cards; concise text density. If any major structural item is missing, fix before sending. Never knowingly send a degraded plain-text substitute.

### DAILY CLOSEOUT // WINS + TOMORROW CORRECTIONS — REQUIRED
Add one prominent canonical-style section near the executive verdict, titled exactly:
`TODAY'S WINS // WHAT CHANGES TOMORROW`

#### LEFT / WINS
- Highlight 2–4 specific, evidence-backed wins from today's data versus the user's recent 7-day/30-day baseline, yesterday, or a stated target.
- Wins may include sleep/recovery improvement, HRV/resting-HR direction, training consistency, steps/active energy, cardio/VO2 trend, glucose stability when current, nutrition adherence only when actually logged, or completion of a prior mission.
- Celebrate meaningful behavior and trend improvements without exaggeration. If evidence is weak, label the win `PROCESS WIN` or `DATA WIN` rather than inventing a physiological result.

#### RIGHT / CHANGE TOMORROW
- Identify only the 1–3 highest-leverage changes for tomorrow.
- Each change must include: CHANGE • EXACT TARGET • WHY • SUCCESS CHECK.
- Rank them P1/P2/P3, tie them to actual data, and avoid generic advice or an overloaded checklist.
- Reconcile this section with Biggest Current Risk, Tomorrow Playbook, Steps for Tomorrow, and the 3 Mission Tomorrow cards so recommendations never conflict.
- If today is partial or missing key data, state the limitation and base changes only on defensible evidence.

Render this as a balanced graphical two-column card on desktop with mobile-safe stacking, fully matching the Aug 10 Golden Master V2 colors, borders, typography, spacing, and density.
