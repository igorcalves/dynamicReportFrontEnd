import React from "react";

interface Column {
  name: string;
  label: string;
  type: string;
}

interface ReportResponse {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
}

export default function ReportTable({ report }: { report: ReportResponse }) {
  if (!report || report.data.length === 0)
    return <p>Nenhum dado encontrado.</p>;

  return (
    <table border={1} style={{ borderCollapse: "collapse", marginTop: 20 }}>
      <thead>
        <tr>
          {report.columns.map((col) => (
            <th key={col.name} style={{ padding: 8 }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {report.data.map((row, i) => (
          <tr key={i}>
            {report.columns.map((col) => (
              <td key={col.name} style={{ padding: 8 }}>
                {row[col.name]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
