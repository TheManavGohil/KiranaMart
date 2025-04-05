"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  FileText, // Generic document icon
  CalendarDays, // Expiry Report
  DollarSign, // Inventory Valuation
  Settings2, // Custom Report
  Download
} from "lucide-react"

// Mock Data for Reports
const mockReports = [
  {
    id: "stock-level",
    title: "Stock Level Report",
    icon: FileText,
    description: "Current stock levels for all products",
    details: "This report provides a detailed overview of current stock levels for all products, including those below threshold.",
    formats: ["Excel", "CSV", "PDF"],
    lastGenerated: "2023-04-04",
  },
  {
    id: "expiry",
    title: "Expiry Report",
    icon: CalendarDays,
    description: "Products approaching expiry date",
    details: "This report lists all products that are approaching their expiry date within the next 30 days.",
    formats: ["Excel", "CSV", "PDF"],
    lastGenerated: "2023-04-03",
  },
  {
    id: "valuation",
    title: "Inventory Valuation",
    icon: DollarSign,
    description: "Total value of current inventory",
    details: "This report provides a detailed valuation of your current inventory based on purchase prices.",
    formats: ["Excel", "CSV", "PDF"],
    lastGenerated: "2023-04-02",
  },
   {
    id: "custom",
    title: "Custom Report",
    icon: Settings2,
    description: "Create a custom inventory report",
    details: "Generate a custom report by selecting specific parameters, date ranges, and product categories.",
    formats: ["Excel", "CSV", "PDF"],
    lastGenerated: "Never", // Example
  },
]

// Function to trigger file download simulation (Copied from analytics page)
const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function InventoryReportsPage() {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  const handleGenerateReport = (reportId: string, format: "CSV" | "PDF" = "CSV") => {
    setGeneratingReport(reportId) // Indicate loading state
    console.log(`Generating ${reportId} report as ${format}...`)

    // Simulate generation and download
    setTimeout(() => {
      const reportData = `Simulated Data for ${reportId} Report\nColumn1,Column2\nValue1,Value2`;
      const filename = `${reportId}_report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      const mimeType = format === "PDF" ? "text/plain" : "text/csv;charset=utf-8;"; // Use txt for PDF sim
      
      downloadFile(filename, reportData, mimeType);
      setGeneratingReport(null) // Clear loading state
    }, 1500) // Simulate delay
  }

  return (
    <div className="animate-fadeIn">
       <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Inventory Reports</h2>
        <p className="text-gray-600 dark:text-gray-400">Generate and download inventory reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReports.map((report) => {
          const Icon = report.icon
          const isGenerating = generatingReport === report.id
          return (
            <Card key={report.id} className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                     <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                   </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</CardTitle>
                </div>
                <CardDescription className="dark:text-gray-400">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{report.details}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p><span className="font-medium">Format:</span> {report.formats.join(", ")}</p>
                    <p><span className="font-medium">Last Generated:</span> {report.lastGenerated}</p>
                  </div>
                </div>
                <Button 
                    className="w-full mt-6 bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-70" 
                    onClick={() => handleGenerateReport(report.id)} // Default to CSV for simplicity here, could add format choice
                    disabled={isGenerating}
                >
                  <Download className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? `Generating ${report.title}...` : "Generate Report"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 