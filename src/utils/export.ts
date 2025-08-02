import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface ExportData {
  [key: string]: any;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  headers?: string[];
  data: ExportData[];
}

export class ExportManager {
  static exportToCSV(options: ExportOptions) {
    const { data, filename = "export", headers } = options;
    
    if (data.length === 0) {
      throw new Error("Nenhum dado para exportar");
    }

    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(","),
      ...data.map(row => 
        csvHeaders.map(header => {
          const value = row[header];
          // Escapar vírgulas e aspas
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static exportToPDF(options: ExportOptions) {
    const { data, filename = "export", title = "Relatório", headers } = options;
    
    if (data.length === 0) {
      throw new Error("Nenhum dado para exportar");
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, 20, { align: "center" });
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      pageWidth / 2,
      30,
      { align: "center" }
    );

    // Preparar dados para a tabela
    const tableHeaders = headers || Object.keys(data[0]);
    const tableData = data.map(row => 
      tableHeaders.map(header => row[header] || "")
    );

    // Adicionar tabela
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Salvar arquivo
    doc.save(`${filename}-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  static formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("pt-BR");
  }

  static formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("pt-BR");
  }
} 