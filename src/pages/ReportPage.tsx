/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import ReportTable from "../components/ReportTable";
import API from "../services/api";

// ================== Interfaces Corrigidas ==================

interface Param {
  name: string;
  label: string;
  type: string;
  options?: { value: any; label: string }[];
}

interface ReportOutput {
  type: string;
  columns: { name: string; label: string; type: string }[];
  headerLayout?: { label: string; rowSpan?: number; colSpan?: number }[][];
}

interface Manifest {
  name: string;
  queryFile: string;
  params?: Param[]; // <-- A correção principal estava aqui
  output: ReportOutput;
}

interface ReportResponse {
  output: ReportOutput;
  data: Record<string, any>[];
}

// ==========================================================


export default function ReportPage({ reportName }: { reportName: string }) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [params, setParams] = useState<Record<string, any>>({});
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.getManifest(reportName)
      .then((data: Manifest) => {
        setManifest(data);
        const initialParams: Record<string, any> = {};
        // Agora 'data.params' é corretamente identificado como um array
        data.params?.forEach((p) => {
          if (p.type === "select" && p.options && p.options.length > 0) {
            initialParams[p.name] = p.options[0].value;
          } else {
            initialParams[p.name] = "";
          }
        });
        setParams(initialParams);
      });
  }, [reportName]);

  const fetchReport = () => {
    if (!manifest) return;
    
    setLoading(true);
    API.getReport(reportName, params)
      .then(setReport)
      .finally(() => setLoading(false));
  };

  if (!manifest) return <div>Carregando manifesto...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">{manifest.name}</h1>
      {/* Agora 'manifest.params' é corretamente identificado como um array */}
      {manifest.params?.map((p) => (
        <span key={p.name} className="mr-4">
          <label>{p.label}: </label>
          {p.type === 'datetime-local' ? (
             <input
              type="datetime-local"
              value={params[p.name] || ''}
              onChange={(e) =>
                setParams({ ...params, [p.name]: e.target.value })
              }
              className="border px-2 py-1"
            />
          ) : p.type === "select" ? (
            <select
              value={params[p.name]}
              onChange={(e) =>
                setParams({ ...params, [p.name]: e.target.value })
              }
              className="border px-2 py-1"
            >
              <option value="">Selecione</option>
              {p.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={p.type === "number" ? "number" : "text"}
              value={params[p.name]}
              onChange={(e) =>
                setParams({ ...params, [p.name]: e.target.value })
              }
              className="border px-2 py-1"
            />
          )}
        </span>
      ))}

      <button
        onClick={fetchReport}
        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
      >
        Filtrar
      </button>

      {loading && <p>Carregando dados...</p>}
      
      {report && (
        <ReportTable 
          output={report.output} 
          data={report.data} 
        />
      )}
    </div>
  );
}