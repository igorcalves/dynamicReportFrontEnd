/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import ReportTable from "../components/ReportTable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "../assets/tracevia_do_brasil_logo.jpeg";
import MultiSelect from "../components/MultiSelect";
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
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/manifests/${reportName}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data: Manifest) => {
        setManifest(data);
        const initialParams: Record<string, any> = {};
        // Agora 'data.params' é corretamente identificado como um array
        data.params?.forEach((p) => {
          if (p.type === "select" && p.options && p.options.length > 0) {
            initialParams[p.name] = p.options[0].value;
          } else if (p.type === "select-multi") {
            initialParams[p.name] = [];
          } else {
            initialParams[p.name] = "";
          }
        });
        setParams(initialParams);
      });
  }, [reportName]);

  const fetchReport = () => {
    if (!manifest) return;
    const filteredParams: Record<string, any> = {};
    for (const key in params) {
      filteredParams[key] = params[key] || null;
    }

    const queryString = new URLSearchParams(filteredParams).toString();
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(
      `http://localhost:8080/reports/${reportName}${
        queryString ? `?${queryString}` : ""
      }`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    )
      .then((res) => res.json())
      .then(setReport)
      .finally(() => setLoading(false));
  };

  if (!manifest) return <div>Carregando manifesto...</div>;

  // Função para obter colunas dinamicamente do backend
  function getDynamicColumns(report: ReportResponse | null) {
    if (report?.output?.columns && report.output.columns.length > 0) {
      return report.output.columns;
    }
    if (report?.data && report.data.length > 0) {
      return Object.keys(report.data[0]).map((key) => ({
        name: key,
        label: key,
        type: "string",
      }));
    }
    return [];
  }

  // Função para exportar para Excel customizado (dinâmico)
  const exportToExcel = async () => {
    if (!report || !manifest) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Relatório");

    const columns = getDynamicColumns(report);
    const lastColLetter = worksheet.getColumn(columns.length + 1).letter;
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    worksheet.getCell("A1").value = manifest.name;
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };

    // Escrever cabeçalhos
    columns.forEach((col, idx) => {
      const cell = worksheet.getCell(2, idx + 1);
      cell.value = col.label;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
    });

    // Pintar linha 2 de amarelo
    for (let colIdx = 1; colIdx <= columns.length; colIdx++) {
      worksheet.getCell(2, colIdx).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
    }

    // Escrever dados
    report.data.forEach((row, rowIdx) => {
      columns.forEach((col, colIdx) => {
        worksheet.getCell(rowIdx + 3, colIdx + 1).value = row[col.name];
      });
    });

    // Ajustar largura das colunas
    columns.forEach((col, idx) => {
      let maxLength = col.label.length;
      report.data.forEach((row) => {
        const value = row[col.name];
        if (value && value.toString().length > maxLength) {
          maxLength = value.toString().length;
        }
      });
      worksheet.getColumn(idx + 1).width = Math.max(maxLength + 2, 10);
    });

    // Adicionar imagem na célula A1
    const response = await fetch(logo);
    const imageBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "jpeg",
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 40 },
    });

    // Gerar arquivo e salvar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `${manifest.name}.xlsx`
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">{manifest.name}</h1>
      {/* Agora 'manifest.params' é corretamente identificado como um array */}
      {manifest.params?.map((p) => (
        <span key={p.name} className="mr-4">
          <label>{p.label}: </label>
          {p.type === "datetime-local" ? (
            <input
              type="datetime-local"
              value={params[p.name] || ""}
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
          ) : p.type === "select-multi" ? (
            <MultiSelect
              name={p.name}
              options={
                p.options
                  ? p.options.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))
                  : []
              }
              value={Array.isArray(params[p.name]) ? params[p.name] : []}
              onChange={(val) => {
                console.log("MultiSelect onChange", p.name, val);
                setParams({ ...params, [p.name]: val });
              }}
            />
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

      {/* Botão de exportação para Excel */}
      {report && (
        <button
          onClick={exportToExcel}
          className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
        >
          Exportar para Excel
        </button>
      )}

      {loading && <p>Carregando dados...</p>}

      {report && (
        <ReportTable
          output={{
            ...report.output,
            columns: getDynamicColumns(report),
          }}
          data={report.data}
        />
      )}
    </div>
  );
}
