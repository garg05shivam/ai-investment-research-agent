import { useMemo, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ScoreBar({ label, value, tone = "emerald" }) {
  const score = Math.max(0, Math.min(10, Number(value) || 0));
  const color = tone === "rose" ? "bg-rose-500" : "bg-emerald-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

function ListBlock({ title, items = [] }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
        {items.filter(Boolean).map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const [company, setCompany] = useState("Reliance Industries");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const decisionTone = useMemo(() => {
    if (!result) return "border-slate-800 bg-slate-900";
    return result.recommendation === "INVEST"
      ? "border-emerald-500/40 bg-emerald-950/40"
      : "border-rose-500/40 bg-rose-950/40";
  }, [result]);

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

      const response = await axios.post(`${API_URL}/api/analyze`, {
        company: company.trim(),
      });

      setResult(response.data.data);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError.response?.data?.message ||
          "Analysis failed. Check the server and API keys, then try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <header className="grid gap-6 border-b border-slate-800 pb-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
              AI Investment Research Agent
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-white sm:text-5xl">
              AlphaLens
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              A multi-agent LangGraph workflow that researches a company,
              scores financial quality and risk, then makes an invest-or-pass
              call with a clear thesis.
            </p>
          </div>

          <form
            onSubmit={analyzeCompany}
            className="rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            <label
              htmlFor="company"
              className="text-sm font-medium text-slate-300"
            >
              Company
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="company"
                type="text"
                placeholder="e.g. HDFC Bank, Apple, Zomato"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="min-h-12 flex-1 rounded-md border border-slate-700 bg-slate-950 px-4 text-white outline-none transition focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 rounded-md bg-cyan-400 px-5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {loading ? "Analyzing" : "Run Agent"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </form>
        </header>

        {loading && (
          <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
              <p className="text-slate-300">
                Researching business model, financial quality, risks, and final
                recommendation...
              </p>
            </div>
          </section>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <section className={`rounded-lg border p-6 ${decisionTone}`}>
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">
                    Final Decision
                  </p>
                  <h2 className="mt-2 text-4xl font-bold">
                    {result.recommendation}
                  </h2>
                  <p className="mt-4 max-w-3xl leading-7 text-slate-200">
                    {result.decisionReason}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/50 px-5 py-4 text-center">
                  <p className="text-sm text-slate-400">Confidence</p>
                  <p className="mt-1 text-3xl font-bold">
                    {result.confidence}%
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-wide text-slate-400">
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

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Scorecard
                </p>
                <div className="mt-5 space-y-5">
                  <ScoreBar
                    label="Financial Quality"
                    value={result.financialScore}
                  />
                  <ScoreBar label="Risk Level" value={result.riskScore} tone="rose" />
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
              <ListBlock title="Next Research" items={result.nextResearchSteps} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Bull Case
                </h3>
                <p className="mt-4 leading-7 text-slate-300">{result.bullCase}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Bear Case
                </h3>
                <p className="mt-4 leading-7 text-slate-300">{result.bearCase}</p>
              </div>
            </section>

            {result.sources?.length > 0 && (
              <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Sources
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {result.sources.map((source, index) => (
                    <a
                      key={`${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-slate-800 bg-slate-950 p-4 text-sm text-cyan-200 transition hover:border-cyan-500"
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
