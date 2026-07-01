import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import heroImage from "./assets/hero.png";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000")
).replace(/\/+$/, "");
const ANALYSIS_TIMEOUT_MS =
  Number(import.meta.env.VITE_ANALYSIS_TIMEOUT_MS) || 180000;

const quickCompanies = [
  "Reliance Industries",
  "TCS",
  "HDFC Bank",
  "Infosys",
  "Apple",
];

const progressSteps = [
  "Searching live context",
  "Building company brief",
  "Scoring financial quality",
  "Mapping risks",
  "Writing final thesis",
];

const previewItems = [
  {
    label: "Business Model",
    value: "Segments, moat, revenue engine",
  },
  {
    label: "Financial Quality",
    value: "Growth, debt, profitability",
  },
  {
    label: "Risk Lens",
    value: "Red flags and watch items",
  },
  {
    label: "Final Thesis",
    value: "Invest-or-pass recommendation",
  },
];

function ScoreBar({ label, value, tone = "emerald" }) {
  const score = Math.max(0, Math.min(10, Number(value) || 0));
  const color =
    tone === "rose"
      ? "from-rose-400 to-orange-300"
      : "from-emerald-300 to-cyan-300";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300/90">{label}</span>
        <span className="font-semibold text-white">{score}/10</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-950/80 ring-1 ring-white/10">
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${color} shadow-[0_0_18px_rgba(34,211,238,0.28)]`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

function ListBlock({ title, items = [] }) {
  return (
    <section className="animate-reveal rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/70">
        {title}
      </h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200/95">
        {items.filter(Boolean).map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.7)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatPill({ label, value, tone = "cyan" }) {
  const toneClass =
    tone === "rose"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : tone === "emerald"
        ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
        : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function buildReport(result) {
  if (!result) return "";

  return [
    `AlphaLens Research Report: ${result.company}`,
    "",
    `Recommendation: ${result.recommendation}`,
    `Confidence: ${result.confidence}%`,
    `Financial Quality: ${result.financialScore}/10`,
    `Risk Level: ${result.riskScore}/10`,
    "",
    "Decision Reason",
    result.decisionReason,
    "",
    "Company Brief",
    result.summary,
    "",
    `Industry: ${result.industry}`,
    `Business Model: ${result.businessModel}`,
    `Growth: ${result.revenueGrowth}`,
    `Profitability: ${result.profitability}`,
    `Debt: ${result.debtLevel}`,
    "",
    "Strengths",
    ...(result.strengths || []).map((item) => `- ${item}`),
    "",
    "Risks",
    ...(result.risks || []).map((item) => `- ${item}`),
    "",
    "Bull Case",
    result.bullCase,
    "",
    "Bear Case",
    result.bearCase,
    "",
    "Next Research",
    ...(result.nextResearchSteps || []).map((item) => `- ${item}`),
  ].join("\n");
}

function App() {
  const [company, setCompany] = useState("Reliance Industries");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProgressIndex((current) =>
        Math.min(current + 1, progressSteps.length - 1)
      );
    }, 1800);

    return () => window.clearInterval(interval);
  }, [loading]);

  const decisionTone = useMemo(() => {
    if (!result) return "border-slate-800 bg-slate-900";
    return result.recommendation === "INVEST"
      ? "border-emerald-300/30 bg-emerald-400/10 shadow-emerald-950/30"
      : "border-rose-300/30 bg-rose-400/10 shadow-rose-950/30";
  }, [result]);

  const reportText = useMemo(() => buildReport(result), [result]);

  const analyzeCompany = async (event) => {
    event.preventDefault();

    if (!company.trim()) {
      setError("Enter a company name to begin.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setCopyStatus("");
      setProgressIndex(0);

      const response = await axios.post(
        `${API_URL}/api/analyze`,
        {
          company: company.trim(),
        },
        {
          timeout: ANALYSIS_TIMEOUT_MS,
        }
      );

      setResult(response.data.data);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError.code === "ECONNABORTED"
          ? "Analysis exceeded three minutes. Check the backend logs and try again."
          : requestError.response?.data?.message ||
              "Analysis failed. Check the server configuration, then try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const chooseCompany = (nextCompany) => {
    setCompany(nextCompany);
    setError("");
  };

  const copyReport = async () => {
    if (!reportText) return;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopyStatus("Copied");
    } catch (clipboardError) {
      console.error(clipboardError);
      setCopyStatus("Copy failed");
    }
  };

  const downloadReport = () => {
    if (!reportText) return;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.company.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-research-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050712] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(99,102,241,0.2),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0)_0%,rgba(15,23,42,0.78)_100%)]" />
      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <header className="grid min-h-[520px] gap-8 pb-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-cyan-100 shadow-lg shadow-cyan-950/20">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              AI Investment Research Agent
            </div>
            <h1 className="mt-5 text-5xl font-bold tracking-normal text-white sm:text-6xl lg:text-7xl">
              AlphaLens
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              A multi-agent LangGraph workflow that researches a company, scores
              financial quality and risk, then makes an invest-or-pass call with
              a clear thesis.
            </p>
            <div className="mt-7 grid max-w-2xl gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {["Research", "Score", "Decide"].map((step, index) => (
                <div
                  key={step}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
                >
                  <p className="text-xs font-semibold text-cyan-200">
                    0{index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-12 top-8 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -right-10 bottom-8 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
            <form
              onSubmit={analyzeCompany}
              className="relative rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/50 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label
                    htmlFor="company"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Company
                  </label>
                  <p className="mt-1 text-sm text-slate-400">
                    Run a full research pass in one click.
                  </p>
                </div>
                <img
                  src={heroImage}
                  alt=""
                  className="h-20 w-20 shrink-0 object-contain opacity-90"
                />
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <input
                  id="company"
                  type="text"
                  placeholder="e.g. HDFC Bank, Apple, Zomato"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="min-h-14 w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 text-white shadow-inner shadow-black/30 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-14 rounded-lg bg-cyan-300 px-5 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:hover:translate-y-0"
                >
                  {loading ? "Analyzing..." : "Run Agent"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickCompanies.map((quickCompany) => (
                  <button
                    key={quickCompany}
                    type="button"
                    onClick={() => chooseCompany(quickCompany)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                  >
                    {quickCompany}
                  </button>
                ))}
              </div>
              {error && (
                <p className="mt-4 rounded-md border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {error}
                </p>
              )}
            </form>
          </div>
        </header>

        {!loading && !result && (
          <section className="animate-reveal grid gap-4 border-t border-white/10 pt-8 md:grid-cols-2 xl:grid-cols-4">
            {previewItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur"
              >
                <p className="text-sm font-semibold text-cyan-100/80">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.value}
                </p>
              </div>
            ))}
          </section>
        )}

        {loading && (
          <section className="animate-reveal mt-8 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-200 border-t-transparent" />
              <div>
                <p className="font-semibold text-slate-100">
                  {progressSteps[progressIndex]}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  AlphaLens is assembling a concise investment view.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-5">
              {progressSteps.map((step, index) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition ${
                    index <= progressIndex
                      ? "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.45)]"
                      : "bg-slate-800"
                  }`}
                  aria-label={step}
                />
              ))}
            </div>
          </section>
        )}

        {result && (
          <div className="animate-reveal mt-8 space-y-6">
            <section className="grid gap-3 md:grid-cols-4">
              <StatPill
                label="Decision"
                value={result.recommendation}
                tone={result.recommendation === "INVEST" ? "emerald" : "rose"}
              />
              <StatPill label="Confidence" value={`${result.confidence}%`} />
              <StatPill
                label="Financial Quality"
                value={`${result.financialScore}/10`}
                tone="emerald"
              />
              <StatPill
                label="Risk Level"
                value={`${result.riskScore}/10`}
                tone="rose"
              />
            </section>

            <section
              className={`rounded-lg border p-6 shadow-2xl backdrop-blur ${decisionTone}`}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-300/80">
                    Final Decision
                  </p>
                  <h2 className="mt-2 text-4xl font-bold">
                    {result.recommendation}
                  </h2>
                  <p className="mt-4 max-w-3xl leading-7 text-slate-200">
                    {result.decisionReason}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    type="button"
                    onClick={copyReport}
                    className="rounded-lg border border-white/10 bg-slate-950/60 px-5 py-3 text-sm font-bold text-cyan-100 shadow-xl shadow-black/20 transition hover:border-cyan-300 hover:bg-cyan-300/10"
                  >
                    {copyStatus || "Copy Report"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadReport}
                    className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-black/20 transition hover:bg-cyan-100"
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
                <p className="text-sm uppercase tracking-wide text-cyan-100/70">
                  Company Brief
                </p>
                <h2 className="mt-2 text-3xl font-bold">{result.company}</h2>
                <p className="mt-4 leading-7 text-slate-300">
                  {result.summary}
                </p>
                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Industry</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {result.industry}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Business Model</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {result.businessModel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
                <p className="text-sm uppercase tracking-wide text-cyan-100/70">
                  Scorecard
                </p>
                <div className="mt-5 space-y-5">
                  <ScoreBar
                    label="Financial Quality"
                    value={result.financialScore}
                  />
                  <ScoreBar
                    label="Risk Level"
                    value={result.riskScore}
                    tone="rose"
                  />
                </div>
                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">Growth:</span>{" "}
                    {result.revenueGrowth}
                  </p>
                  <p>
                    <span className="text-slate-500">Profitability:</span>{" "}
                    {result.profitability}
                  </p>
                  <p>
                    <span className="text-slate-500">Debt:</span>{" "}
                    {result.debtLevel}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ListBlock title="Strengths" items={result.strengths} />
              <ListBlock title="Watch Items" items={result.watchItems} />
              <ListBlock title="Risks" items={result.risks} />
              <ListBlock
                title="Next Research"
                items={result.nextResearchSteps}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-100/80">
                  Bull Case
                </h3>
                <p className="mt-4 leading-7 text-slate-300">
                  {result.bullCase}
                </p>
              </div>
              <div className="rounded-lg border border-rose-300/20 bg-rose-300/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-100/80">
                  Bear Case
                </h3>
                <p className="mt-4 leading-7 text-slate-300">
                  {result.bearCase}
                </p>
              </div>
            </section>

            {result.sources?.length > 0 && (
              <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-100/70">
                  Sources
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {result.sources.map((source, index) => (
                    <a
                      key={`${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-white/10 bg-slate-950/70 p-4 text-sm text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300/10"
                    >
                      {source.title || source.url}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
