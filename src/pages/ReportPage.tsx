/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import ReportTable from "../components/ReportTable";

interface Param {
  name: string;
  label: string;
  type: string;
}
interface Column {
  name: string;
  label: string;
  type: string;
}
interface Manifest {
  name: string;
  queryFile: string;
  params?: Param[];
  output: { type: string; columns: Column[] };
}
interface ReportResponse {
  columns: Column[];
  data: Record<string, any>[];
}

export default function ReportPage({ reportName }: { reportName: string }) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [params, setParams] = useState<Record<string, any>>({});
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/manifests/${reportName}`)
      .then((res) => res.json())
      .then((data: Manifest) => {
        setManifest(data);
        const initialParams: Record<string, any> = {};
        data.params?.forEach((p) => (initialParams[p.name] = ""));
        setParams(initialParams);
        if (!data.params || data.params.length === 0)
          fetchReport(initialParams);
      });
  }, [reportName]);

  const fetchReport = (currentParams?: Record<string, any>) => {
    if (!manifest) return;
    const filteredParams: Record<string, any> = {};
    const p = currentParams || params;
    for (const key in p)
      if (p[key] !== "" && p[key] != null) filteredParams[key] = p[key];
    const queryString = new URLSearchParams(filteredParams).toString();
    setLoading(true);
    fetch(
      `http://localhost:8080/reports/${reportName}${
        queryString ? `?${queryString}` : ""
      }`
    )
      .then((res) => res.json())
      .then(setReport)
      .finally(() => setLoading(false));
  };

  if (!manifest) return <div>Carregando manifesto...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">{manifest.name}</h1>
      {manifest.params && manifest.params.length > 0 && (
        <div className="mb-4 space-x-2">
          {manifest.params.map((p) => (
            <span key={p.name}>
              <label>{p.label}: </label>
              <input
                type={p.type === "number" ? "number" : "text"}
                value={params[p.name]}
                onChange={(e) =>
                  setParams({ ...params, [p.name]: e.target.value })
                }
                className="border px-2 py-1"
              />
            </span>
          ))}
          <button
            onClick={() => fetchReport()}
            className="bg-blue-500 text-white px-3 py-1"
          >
            Filtrar
          </button>
        </div>
      )}
      {loading && <p>Carregando dados...</p>}
      {report && <ReportTable report={report} />}
    </div>
  );
}
