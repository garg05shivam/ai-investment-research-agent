import { useState } from "react";
import axios from "axios";

function App() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeCompany = async () => {
    if (!company) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        {
          company,
        }
      );

      setResult(response.data.data);
    } catch (error) {
      console.error(error);
      alert("Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto p-8">

        <h1 className="text-5xl font-bold text-center mb-3">
          AlphaLens 🚀
        </h1>

        <p className="text-center text-slate-400 mb-10">
          AI Powered Investment Research Agent
        </p>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg">
          <input
            type="text"
            placeholder="Enter Company Name..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
          />

          <button
            onClick={analyzeCompany}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-semibold"
          >
            Analyze Company
          </button>
        </div>

        {loading && (
          <div className="text-center mt-8">
            <p>🔍 Researching Company...</p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">

            <div className="bg-slate-900 p-6 rounded-2xl">
              <h2 className="text-3xl font-bold mb-3">
                {result.company}
              </h2>

              <p className="text-slate-300">
                {result.summary}
              </p>

              <p className="mt-3">
                <span className="font-semibold">Industry:</span>{" "}
                {result.industry}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <div className="bg-slate-900 p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-3">
                  Strengths
                </h3>

                <ul className="list-disc pl-5 space-y-2">
                  {result.strengths?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-3">
                  Investment Metrics
                </h3>

                <p>📈 Financial Score: {result.financialScore}</p>

                <p className="mt-2">
                  ⚠ Risk Score: {result.riskScore}
                </p>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl ${
                result.recommendation === "INVEST"
                  ? "bg-green-700"
                  : "bg-red-700"
              }`}
            >
              <h3 className="text-2xl font-bold">
                {result.recommendation === "INVEST"
                  ? "🟢 INVEST"
                  : "🔴 PASS"}
              </h3>

              <p className="mt-2">
                Confidence: {result.confidence}%
              </p>

              <p className="mt-2">
                {result.decisionReason}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;