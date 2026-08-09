"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleGauge,
  Database,
  Dna,
  Download,
  FlaskConical,
  HeartPulse,
  Info,
  Moon,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateReadiness,
  demoSnapshot,
  HealthSnapshot,
  MetricKey,
  parseHealthSnapshot,
  ScenarioInputs,
  scenarioPresets,
  simulateScenario,
} from "../lib/health-model";

const metricIcons: Record<MetricKey, typeof Moon> = {
  sleep: Moon,
  hrv: HeartPulse,
  restingHr: Activity,
  vo2max: Wind,
  steps: Zap,
  exercise: CircleGauge,
  spo2Low: Dna,
};

const metricOrder: MetricKey[] = [
  "sleep",
  "hrv",
  "restingHr",
  "vo2max",
  "steps",
  "exercise",
  "spo2Low",
];

function formatValue(key: MetricKey, value: number) {
  if (key === "steps") return Math.round(value).toLocaleString();
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function metricStatus(snapshot: HealthSnapshot, key: MetricKey) {
  const metric = snapshot.metrics[key];
  const [low, high] = metric.goal;
  if (metric.value >= low && metric.value <= high) return "on-target";
  if (metric.higherIsBetter) return metric.value < low * 0.9 ? "off-target" : "watch";
  return metric.value > high * 1.08 ? "off-target" : "watch";
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  const inputId = `scenario-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="slider-row">
      <span className="slider-heading">
        <label htmlFor={inputId}>{label}</label>
        <output>
          {value.toLocaleString()}
          <small>{suffix}</small>
        </output>
      </span>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <p>{copy}</p>
    </div>
  );
}

export function HealthCommandCenter() {
  const [snapshot, setSnapshot] = useState<HealthSnapshot>(demoSnapshot);
  const [inputs, setInputs] = useState<ScenarioInputs>(scenarioPresets.Current);
  const [activePreset, setActivePreset] = useState("Current");
  const [notice, setNotice] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const readiness = useMemo(() => calculateReadiness(snapshot), [snapshot]);
  const result = useMemo(() => simulateScenario(snapshot, inputs), [snapshot, inputs]);
  const baseline = useMemo(
    () => simulateScenario(snapshot, scenarioPresets.Current),
    [snapshot],
  );

  const update = (key: keyof ScenarioInputs, value: number) => {
    setActivePreset("Custom");
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const selectPreset = (name: string) => {
    setActivePreset(name);
    setInputs(scenarioPresets[name]);
  };

  const importSnapshot = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const next = parseHealthSnapshot(await file.text());
      setSnapshot(next);
      setInputs((current) => ({
        ...current,
        sleepHours: Number(next.metrics.sleep.sevenDay.toFixed(1)),
        dailySteps: Math.round(next.metrics.steps.sevenDay),
      }));
      setNotice(`Loaded ${file.name}. Data stays in this browser session.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "That file could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  const exportScenario = () => {
    const payload = JSON.stringify(
      { exportedAt: new Date().toISOString(), snapshot, assumptions: inputs, result },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "jarvis-scenario.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const asOf = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(snapshot.asOf));

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="JARVIS Health Alpha home">
          <span className="brand-mark">J</span>
          <span>JARVIS</span>
          <em>HEALTH ALPHA</em>
        </a>
        <nav aria-label="Dashboard sections">
          <a href="#signals">Signals</a>
          <a href="#lab">Scenario lab</a>
          <a href="#protocol">Protocol</a>
        </nav>
        <button className="data-button" onClick={() => fileInput.current?.click()}>
          <Upload size={15} /> Import data
        </button>
        <input
          ref={fileInput}
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={importSnapshot}
        />
      </header>

      {notice && (
        <div className="notice" role="status">
          <Check size={16} /> {notice}
          <button onClick={() => setNotice(null)} aria-label="Dismiss message">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="live-line">
            <span className="pulse" /> {snapshot.source === "demo" ? "DEMO MODE" : "LOCAL PRIVATE DATA"}
            <i /> Snapshot through {asOf}
          </div>
          <h1>
            One body.
            <br />
            <span>One operating system.</span>
          </h1>
          <p>
            A quantitative health control room that separates signal from noise,
            prices the trade-offs, and turns today&apos;s constraints into a protocol.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#lab">
              Run a scenario <ChevronRight size={17} />
            </a>
            <button className="secondary-action" onClick={() => setMethodOpen(true)}>
              <FlaskConical size={16} /> How the model works
            </button>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={17} />
            <span>
              Browser-local by design. Raw health files are never uploaded by this interface.
            </span>
          </div>
        </div>

        <div className="hero-terminal" aria-label="Current health signal summary">
          <div className="terminal-head">
            <span>CONTROL ROOM / {snapshot.profile.toUpperCase()}</span>
            <span className="terminal-clock">LIVE MODEL</span>
          </div>
          <div className="terminal-body">
            <div
              className="score-ring"
              style={{ "--score": `${readiness * 3.6}deg` } as React.CSSProperties}
            >
              <div>
                <strong>{readiness}</strong>
                <span>READINESS</span>
              </div>
            </div>
            <div className="constraint-copy">
              <span className="risk-label">TOP CONSTRAINT</span>
              <h3>Recovery capacity</h3>
              <p>
                Sleep is below specification while training demand remains active.
                Improve the recovery base before adding more intensity.
              </p>
              <div className="signal-row">
                <span className="red-dot" /> SLEEP GAP
                <span className="amber-dot" /> OXYGEN WATCH
                <span className="green-dot" /> AUTONOMIC STABLE
              </div>
            </div>
          </div>
          <div className="terminal-foot">
            <span>Model confidence</span>
            <strong>{result.confidence}</strong>
            <span>Data coverage</span>
            <strong>{Math.round(metricOrder.reduce((sum, key) => sum + snapshot.metrics[key].coverageDays, 0) / metricOrder.length)} days avg</strong>
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="Current metrics">
        <div className="ticker-track">
          {[...metricOrder, ...metricOrder].map((key, index) => {
            const metric = snapshot.metrics[key];
            const favorable = metric.higherIsBetter
              ? metric.value >= metric.ninetyDay
              : metric.value <= metric.ninetyDay;
            return (
              <span key={`${key}-${index}`}>
                <b>{metric.label.toUpperCase()}</b> {formatValue(key, metric.value)} {metric.unit}
                {favorable ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              </span>
            );
          })}
        </div>
      </section>

      <section className="shell section" id="signals">
        <SectionTitle
          eyebrow="01 / Signal stack"
          title="The metrics that move the system"
          copy="Current values are read against your own rolling baseline and an explicit performance range—not generic red/green thresholds alone."
        />
        {snapshot.source === "demo" && (
          <div className="demo-banner">
            <Info size={17} />
            <div>
              <strong>Privacy-safe demo data</strong>
              <span>Import a JARVIS snapshot JSON to replace every value in this view.</span>
            </div>
            <button onClick={() => fileInput.current?.click()}>Load mine</button>
          </div>
        )}
        <div className="metric-grid">
          {metricOrder.map((key) => {
            const metric = snapshot.metrics[key];
            const Icon = metricIcons[key];
            const status = metricStatus(snapshot, key);
            const delta = ((metric.sevenDay - metric.ninetyDay) / Math.max(metric.ninetyDay, 1)) * 100;
            return (
              <article className={`metric-card ${status}`} key={key}>
                <div className="metric-card-head">
                  <span className="metric-icon"><Icon size={17} /></span>
                  <span className="status-pill">{status.replace("-", " ")}</span>
                </div>
                <div className="metric-value">
                  {formatValue(key, metric.value)} <small>{metric.unit}</small>
                </div>
                <h3>{metric.label}</h3>
                <div className="metric-comparison">
                  <span>7D {formatValue(key, metric.sevenDay)}</span>
                  <span className={delta >= 0 ? "positive" : "negative"}>
                    {delta >= 0 ? "+" : ""}{delta.toFixed(1)}% vs 90D
                  </span>
                </div>
                <div className="goal-track">
                  <span style={{ width: `${Math.min(100, Math.max(5, (metric.value / metric.goal[1]) * 100))}%` }} />
                </div>
                <p>Target {formatValue(key, metric.goal[0])}–{formatValue(key, metric.goal[1])} {metric.unit}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section lab-section" id="lab">
        <div className="shell">
          <SectionTitle
            eyebrow="02 / Scenario laboratory"
            title="Price the next 180 days"
            copy="Adjust the controllable inputs. The engine runs a seeded 1,200-path uncertainty simulation and shows direction, range, and the assumptions behind it."
          />

          <div className="scenario-shell">
            <aside className="control-panel">
              <div className="panel-heading">
                <div>
                  <span>ASSUMPTION BOOK</span>
                  <h3>Change the inputs</h3>
                </div>
                <BrainCircuit size={22} />
              </div>
              <div className="preset-row" role="group" aria-label="Scenario presets">
                {Object.keys(scenarioPresets).map((name) => (
                  <button
                    key={name}
                    className={activePreset === name ? "active" : ""}
                    onClick={() => selectPreset(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="slider-stack">
                <Slider label="Nightly sleep" value={inputs.sleepHours} min={4} max={9} step={0.1} suffix=" h" onChange={(v) => update("sleepHours", v)} />
                <Slider label="Zone 2 volume" value={inputs.zone2Minutes} min={0} max={240} step={10} suffix=" min/wk" onChange={(v) => update("zone2Minutes", v)} />
                <Slider label="VO₂ sessions" value={inputs.intervalSessions} min={0} max={3} step={1} suffix=" /wk" onChange={(v) => update("intervalSessions", v)} />
                <Slider label="Daily movement" value={inputs.dailySteps} min={3000} max={15000} step={250} suffix=" steps" onChange={(v) => update("dailySteps", v)} />
                <Slider label="Protein" value={inputs.proteinPerKg} min={0.6} max={2.4} step={0.1} suffix=" g/kg" onChange={(v) => update("proteinPerKg", v)} />
                <Slider label="Energy balance" value={inputs.calorieBalance} min={-800} max={500} step={50} suffix=" kcal" onChange={(v) => update("calorieBalance", v)} />
                <Slider label="Strength exposure" value={inputs.strengthSessions} min={0} max={5} step={1} suffix=" /wk" onChange={(v) => update("strengthSessions", v)} />
              </div>
            </aside>

            <div className="model-output">
              <div className="outcome-strip">
                <div>
                  <span>180D VO₂ ESTIMATE</span>
                  <strong>{result.projectedVo2.toFixed(1)}</strong>
                  <small>ml/kg/min</small>
                  <em className={result.projectedVo2 >= baseline.projectedVo2 ? "up" : "down"}>
                    {result.projectedVo2 >= baseline.projectedVo2 ? "+" : ""}
                    {(result.projectedVo2 - baseline.projectedVo2).toFixed(1)} vs current
                  </em>
                </div>
                <div>
                  <span>RECOVERY CAPACITY</span>
                  <strong>{result.recoveryScore}</strong>
                  <small>/ 100 modeled</small>
                  <em>{result.risk} risk</em>
                </div>
                <div>
                  <span>RESTING HR</span>
                  <strong>{result.projectedRestingHr.toFixed(1)}</strong>
                  <small>bpm at 180D</small>
                  <em>directional estimate</em>
                </div>
                <div>
                  <span>GOAL PROBABILITY</span>
                  <strong>{result.targetProbability}%</strong>
                  <small>VO₂ lower target</small>
                  <em>{result.confidence} confidence</em>
                </div>
              </div>

              <article className="chart-card forecast-card">
                <div className="chart-heading">
                  <div>
                    <span>FORECAST / VO₂ MAX</span>
                    <h3>Scenario trajectory with P10–P90 range</h3>
                  </div>
                  <div className="legend">
                    <span><i className="legend-scenario" /> Scenario</span>
                    <span><i className="legend-base" /> Current pattern</span>
                  </div>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.forecast} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="uncertainty" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#79f2c0" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#79f2c0" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#23312e" vertical={false} />
                      <XAxis dataKey="day" tickFormatter={(value) => `${value}d`} stroke="#71817d" tickLine={false} axisLine={false} />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#71817d" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#0d1514", border: "1px solid #2b3b37", borderRadius: 10 }} labelFormatter={(value) => `Day ${value}`} />
                      <Area type="monotone" dataKey="high" stroke="none" fill="url(#uncertainty)" />
                      <Area type="monotone" dataKey="low" stroke="none" fill="#07100e" />
                      <Line type="monotone" dataKey="baseline" stroke="#71817d" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="scenario" stroke="#79f2c0" dot={{ fill: "#79f2c0", r: 3 }} strokeWidth={3} />
                      <ReferenceLine y={snapshot.metrics.vo2max.goal[0]} stroke="#e7b85c" strokeDasharray="3 6" label={{ value: "GOAL", fill: "#e7b85c", position: "insideTopRight", fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <div className="chart-pair">
                <article className="chart-card driver-card">
                  <div className="chart-heading">
                    <div>
                      <span>FACTOR ATTRIBUTION</span>
                      <h3>Modeled annualized VO₂ impact</h3>
                    </div>
                  </div>
                  <div className="driver-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.drivers} layout="vertical" margin={{ top: 0, right: 16, left: 6, bottom: 0 }}>
                        <CartesianGrid stroke="#23312e" horizontal={false} />
                        <XAxis type="number" stroke="#71817d" tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" width={70} stroke="#9caeaa" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "#0d1514", border: "1px solid #2b3b37", borderRadius: 10 }} formatter={(value) => [`${value} pts/year`, "Impact"]} />
                        <ReferenceLine x={0} stroke="#53625f" />
                        <Bar dataKey="impact" radius={[0, 5, 5, 0]}>
                          {result.drivers.map((item) => (
                            <Cell key={item.name} fill={item.impact >= 0 ? "#79f2c0" : "#ff766f"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="chart-card risk-card">
                  <div className="chart-heading">
                    <div>
                      <span>MODEL RISK MEMO</span>
                      <h3>What could break the forecast</h3>
                    </div>
                    <AlertTriangle size={20} />
                  </div>
                  <ul>
                    <li><span>01</span><div><strong>Association is not causation.</strong><p>Slider effects are transparent assumptions, not treatment-effect estimates.</p></div></li>
                    <li><span>02</span><div><strong>Wearables are noisy.</strong><p>Trends need repeated measurements and comparable conditions.</p></div></li>
                    <li><span>03</span><div><strong>Missing nutrition and load data.</strong><p>Body composition and strength forecasts remain intentionally constrained.</p></div></li>
                  </ul>
                  <button onClick={() => setMethodOpen(true)}>Inspect methodology <ChevronRight size={15} /></button>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell section" id="protocol">
        <SectionTitle
          eyebrow="03 / Execution protocol"
          title="Today’s highest-return moves"
          copy="The protocol prioritizes constraints. It does not reward doing more when recovery capacity is the limiting factor."
        />
        <div className="protocol-grid">
          <article className="mission-card priority">
            <span className="mission-number">01</span>
            <div className="mission-icon"><Moon /></div>
            <span className="mission-type">RECOVERY CAPACITY</span>
            <h3>Protect the sleep window</h3>
            <p>Create an 8-hour opportunity and remove the late-session trade-off.</p>
            <div><Target size={15} /> Win condition: ≥7.5 hours actual sleep</div>
          </article>
          <article className="mission-card">
            <span className="mission-number">02</span>
            <div className="mission-icon"><Wind /></div>
            <span className="mission-type">AEROBIC ENGINE</span>
            <h3>Build, don’t test</h3>
            <p>Use controlled Zone 2 volume; finish with enough capacity to repeat it.</p>
            <div><Target size={15} /> Win condition: 40–50 min conversational</div>
          </article>
          <article className="mission-card">
            <span className="mission-number">03</span>
            <div className="mission-icon"><Activity /></div>
            <span className="mission-type">MOVEMENT QUALITY</span>
            <h3>Accumulate clean volume</h3>
            <p>Reach the step floor with relaxed gait mechanics, not junk intensity.</p>
            <div><Target size={15} /> Win condition: 8–10k low-strain steps</div>
          </article>
        </div>

        <div className="data-ledger">
          <div>
            <Database size={24} />
            <div><span>DATA LEDGER</span><h3>Know what the system knows</h3></div>
          </div>
          <ul>
            <li><Check size={15} /> Sleep, HRV, resting HR, movement</li>
            <li><Check size={15} /> VO₂ and aerobic trend</li>
            <li className="missing"><X size={15} /> Nutrition intake not connected</li>
            <li className="missing"><X size={15} /> Bench sets / RPE not connected</li>
          </ul>
          <button onClick={() => fileInput.current?.click()}><Upload size={15} /> Import snapshot</button>
        </div>
      </section>

      <section className="closing">
        <div className="shell closing-inner">
          <div>
            <Sparkles size={23} />
            <span>THE JARVIS PRINCIPLE</span>
            <h2>Measure the system. Change one lever. Reprice the future.</h2>
          </div>
          <button onClick={exportScenario}><Download size={16} /> Export scenario</button>
        </div>
      </section>

      <footer className="shell">
        <span>JARVIS HEALTH ALPHA / PERFORMANCE INTELLIGENCE</span>
        <p>For wellness planning, not diagnosis or medical treatment. Persistent concerning oxygen, heart-rate, sleep, or symptom patterns deserve clinical evaluation.</p>
      </footer>

      {methodOpen && (
        <div className="modal-backdrop">
          <button className="modal-dismiss-layer" aria-label="Close methodology" onClick={() => setMethodOpen(false)} />
          <section className="method-modal" role="dialog" aria-modal="true" aria-labelledby="method-title">
            <button className="modal-close" onClick={() => setMethodOpen(false)} aria-label="Close methodology"><X /></button>
            <span className="eyebrow">MODEL CARD / V1.0</span>
            <h2 id="method-title">Transparent first. Complex only when earned.</h2>
            <p className="method-lead">The browser model converts a small set of user-controlled assumptions into directional 30-, 90-, and 180-day ranges. It does not claim medical causality.</p>
            <div className="method-grid">
              <div><BarChart3 /><strong>Baseline</strong><p>Your current metric level and rolling windows anchor every scenario.</p></div>
              <div><FlaskConical /><strong>Simulation</strong><p>1,200 seeded paths add uncertainty that widens with the forecast horizon.</p></div>
              <div><BrainCircuit /><strong>Model ladder</strong><p>Persistence and trend models must beat naive baselines before ML is promoted.</p></div>
              <div><ShieldCheck /><strong>Privacy</strong><p>Imported JSON is parsed in memory and is not sent to a server by this interface.</p></div>
            </div>
            <div className="method-note"><Info size={18} /><p>TensorFlow is intentionally gated. The companion Python pipeline requires sufficient observations and time-series backtesting before an ML forecast can be labeled production-ready.</p></div>
          </section>
        </div>
      )}
    </main>
  );
}
