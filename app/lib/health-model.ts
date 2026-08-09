export type MetricKey =
  | "sleep"
  | "hrv"
  | "restingHr"
  | "vo2max"
  | "steps"
  | "exercise"
  | "spo2Low";

export type HealthMetric = {
  label: string;
  value: number;
  unit: string;
  sevenDay: number;
  ninetyDay: number;
  goal: [number, number];
  higherIsBetter: boolean;
  coverageDays: number;
};

export type HealthSnapshot = {
  profile: string;
  asOf: string;
  source: "demo" | "imported";
  metrics: Record<MetricKey, HealthMetric>;
};

export type ScenarioInputs = {
  sleepHours: number;
  zone2Minutes: number;
  intervalSessions: number;
  dailySteps: number;
  proteinPerKg: number;
  calorieBalance: number;
  strengthSessions: number;
};

export type ForecastPoint = {
  day: number;
  baseline: number;
  scenario: number;
  low: number;
  high: number;
};

export type ScenarioResult = {
  recoveryScore: number;
  projectedVo2: number;
  projectedRestingHr: number;
  targetProbability: number;
  confidence: "Low" | "Low–moderate" | "Moderate";
  risk: "Elevated" | "Guarded" | "Managed";
  forecast: ForecastPoint[];
  drivers: { name: string; impact: number; detail: string }[];
};

export const demoSnapshot: HealthSnapshot = {
  profile: "Demo athlete",
  asOf: "2026-08-08T23:59:00-07:00",
  source: "demo",
  metrics: {
    sleep: {
      label: "Sleep",
      value: 6.2,
      unit: "h",
      sevenDay: 6.1,
      ninetyDay: 6.3,
      goal: [7.5, 8.5],
      higherIsBetter: true,
      coverageDays: 84,
    },
    hrv: {
      label: "HRV",
      value: 42.6,
      unit: "ms",
      sevenDay: 40.1,
      ninetyDay: 38.9,
      goal: [39, 55],
      higherIsBetter: true,
      coverageDays: 89,
    },
    restingHr: {
      label: "Resting HR",
      value: 68,
      unit: "bpm",
      sevenDay: 69.2,
      ninetyDay: 71.4,
      goal: [55, 68],
      higherIsBetter: false,
      coverageDays: 87,
    },
    vo2max: {
      label: "VO₂ max",
      value: 34.2,
      unit: "ml/kg/min",
      sevenDay: 34.1,
      ninetyDay: 33.4,
      goal: [42, 50],
      higherIsBetter: true,
      coverageDays: 18,
    },
    steps: {
      label: "Steps",
      value: 9140,
      unit: "/day",
      sevenDay: 7860,
      ninetyDay: 7420,
      goal: [8000, 11000],
      higherIsBetter: true,
      coverageDays: 92,
    },
    exercise: {
      label: "Exercise",
      value: 41,
      unit: "min",
      sevenDay: 34,
      ninetyDay: 29,
      goal: [30, 60],
      higherIsBetter: true,
      coverageDays: 81,
    },
    spo2Low: {
      label: "SpO₂ low",
      value: 94,
      unit: "%",
      sevenDay: 93.8,
      ninetyDay: 94.4,
      goal: [95, 100],
      higherIsBetter: true,
      coverageDays: 76,
    },
  },
};

export const scenarioPresets: Record<string, ScenarioInputs> = {
  Downside: {
    sleepHours: 5.6,
    zone2Minutes: 35,
    intervalSessions: 0,
    dailySteps: 5200,
    proteinPerKg: 1.0,
    calorieBalance: 350,
    strengthSessions: 1,
  },
  Current: {
    sleepHours: 6.2,
    zone2Minutes: 70,
    intervalSessions: 1,
    dailySteps: 7600,
    proteinPerKg: 1.4,
    calorieBalance: 0,
    strengthSessions: 2,
  },
  Optimized: {
    sleepHours: 7.8,
    zone2Minutes: 150,
    intervalSessions: 1,
    dailySteps: 9500,
    proteinPerKg: 1.8,
    calorieBalance: -200,
    strengthSessions: 3,
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number) {
  const u = Math.max(random(), 1e-9);
  const v = Math.max(random(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function calculateReadiness(snapshot: HealthSnapshot) {
  const m = snapshot.metrics;
  const sleep = clamp(m.sleep.value / 7.5, 0, 1.12);
  const hrv = clamp(m.hrv.value / Math.max(m.hrv.ninetyDay, 1), 0.65, 1.25);
  const rhr = clamp(m.restingHr.ninetyDay / Math.max(m.restingHr.value, 1), 0.75, 1.2);
  const oxygen = clamp((m.spo2Low.value - 88) / 7, 0, 1);
  return Math.round(clamp((sleep * 0.4 + hrv * 0.25 + rhr * 0.2 + oxygen * 0.15) * 100, 0, 100));
}

export function simulateScenario(
  snapshot: HealthSnapshot,
  inputs: ScenarioInputs,
): ScenarioResult {
  const baseVo2 = snapshot.metrics.vo2max.value;
  const sleepDelta = inputs.sleepHours - snapshot.metrics.sleep.sevenDay;
  const stepDelta = (inputs.dailySteps - snapshot.metrics.steps.sevenDay) / 1000;
  const aerobicDose = Math.min(inputs.zone2Minutes, 240) / 150;
  const intervalDose = Math.min(inputs.intervalSessions, 2) / 1.5;
  const proteinScore = clamp((inputs.proteinPerKg - 0.8) / 1.0, 0, 1);
  const energyStress = Math.max(0, Math.abs(inputs.calorieBalance) - 350) / 650;
  const recoveryLift = clamp(sleepDelta / 1.8, -0.8, 1);

  const annualizedVo2Gain =
    0.55 +
    2.25 * aerobicDose +
    1.4 * intervalDose +
    0.8 * Math.max(recoveryLift, -0.5) +
    0.18 * stepDelta -
    0.65 * energyStress;
  const rhrImprovement =
    0.45 + 1.55 * aerobicDose + 0.8 * Math.max(recoveryLift, -0.4);

  const forecast: ForecastPoint[] = [0, 30, 90, 180].map((day) => {
    const random = mulberry32(1907 + day * 31);
    const paths = Array.from({ length: 1200 }, () => {
      const mean = baseVo2 + annualizedVo2Gain * (day / 365);
      const uncertainty = 0.22 + 0.9 * Math.sqrt(day / 180);
      return mean + normal(random) * uncertainty;
    }).sort((a, b) => a - b);
    const pick = (p: number) => paths[Math.floor((paths.length - 1) * p)];
    return {
      day,
      baseline: Number((baseVo2 + 0.55 * (day / 365)).toFixed(2)),
      scenario: Number(pick(0.5).toFixed(2)),
      low: Number(pick(0.1).toFixed(2)),
      high: Number(pick(0.9).toFixed(2)),
    };
  });

  const recoveryScore = Math.round(
    clamp(
      37 +
        inputs.sleepHours * 6.2 +
        aerobicDose * 6 +
        proteinScore * 5 -
        energyStress * 9 -
        Math.max(inputs.strengthSessions - 4, 0) * 3,
      0,
      100,
    ),
  );
  const projectedVo2 = forecast.at(-1)?.scenario ?? baseVo2;
  const projectedRestingHr = Number(
    Math.max(48, snapshot.metrics.restingHr.value - rhrImprovement * (180 / 365)).toFixed(1),
  );
  const target = snapshot.metrics.vo2max.goal[0];
  const final = forecast.at(-1)!;
  const targetProbability = Math.round(
    clamp(((final.high - target) / Math.max(final.high - final.low, 0.1)) * 100, 0, 100),
  );

  const drivers = [
    {
      name: "Sleep",
      impact: Number((recoveryLift * 1.45).toFixed(2)),
      detail: `${inputs.sleepHours.toFixed(1)} h nightly`,
    },
    {
      name: "Zone 2",
      impact: Number((aerobicDose * 2.25).toFixed(2)),
      detail: `${inputs.zone2Minutes} min weekly`,
    },
    {
      name: "Intervals",
      impact: Number((intervalDose * 1.4).toFixed(2)),
      detail: `${inputs.intervalSessions} session${inputs.intervalSessions === 1 ? "" : "s"} weekly`,
    },
    {
      name: "Movement",
      impact: Number((stepDelta * 0.18).toFixed(2)),
      detail: `${inputs.dailySteps.toLocaleString()} steps daily`,
    },
    {
      name: "Energy load",
      impact: Number((-energyStress * 0.65).toFixed(2)),
      detail: `${inputs.calorieBalance > 0 ? "+" : ""}${inputs.calorieBalance} kcal/day`,
    },
  ];

  return {
    recoveryScore,
    projectedVo2,
    projectedRestingHr,
    targetProbability,
    confidence: snapshot.metrics.vo2max.coverageDays >= 45 ? "Moderate" : "Low–moderate",
    risk: recoveryScore < 58 ? "Elevated" : recoveryScore < 75 ? "Guarded" : "Managed",
    forecast,
    drivers,
  };
}

export function parseHealthSnapshot(raw: string): HealthSnapshot {
  const parsed = JSON.parse(raw) as Partial<HealthSnapshot>;
  if (!parsed.metrics || !parsed.asOf) {
    throw new Error("The file needs an asOf timestamp and metrics object.");
  }
  const required: MetricKey[] = [
    "sleep",
    "hrv",
    "restingHr",
    "vo2max",
    "steps",
    "exercise",
    "spo2Low",
  ];
  for (const key of required) {
    const metric = parsed.metrics[key];
    if (!metric || !Number.isFinite(metric.value) || !Number.isFinite(metric.sevenDay)) {
      throw new Error(`Missing or invalid metric: ${key}.`);
    }
  }
  return {
    profile: parsed.profile || "Imported profile",
    asOf: parsed.asOf,
    source: "imported",
    metrics: parsed.metrics as Record<MetricKey, HealthMetric>,
  };
}
