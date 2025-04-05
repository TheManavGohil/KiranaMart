"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from "recharts"
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Download,
  FileText, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Percent, 
  Check, 
  Signal
} from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock Data Structures
interface KpiData {
  title: string
  value: string
  trendValue: number
  trendPositive: boolean
  trendContext: string // e.g., "from start", "from last month"
  isCurrency?: boolean
  isPercent?: boolean
}

interface ChartDataPoint {
  name: string
  sales: number
  profit: number
}

interface AnalyticsData {
  kpis: KpiData[]
  chartData: ChartDataPoint[]
}

// Function to generate mock data (can be adapted based on filters)
const generateMockData = (tab: string): AnalyticsData => {
  // Simulate data changing based on tab
  const multiplier = tab === "Monthly" ? 1.1 : tab === "Weekly" ? 0.9 : 1
  return {
    kpis: [
      {
        title: "Total Earnings",
        value: (2489562 * multiplier).toFixed(0),
        trendValue: 18.2,
        trendPositive: true,
        trendContext: "from start",
        isCurrency: true,
      },
      {
        title: "Total Profit",
        value: (945230 * multiplier).toFixed(0),
        trendValue: 12.5,
        trendPositive: true,
        trendContext: "from start",
        isCurrency: true,
      },
      {
        title: "Profit Margin",
        value: (37.9 * (multiplier > 1 ? 1.02 : 0.98)).toFixed(1),
        trendValue: 2.1,
        trendPositive: true,
        trendContext: "from last month",
        isPercent: true,
      },
    ],
    chartData: [
      { name: "Jan", sales: 3000 * multiplier, profit: 1200 * multiplier },
      { name: "Feb", sales: 2000 * multiplier, profit: 800 * multiplier },
      { name: "Mar", sales: 2780 * multiplier, profit: 1100 * multiplier },
      { name: "Apr", sales: 1890 * multiplier, profit: 750 * multiplier },
      { name: "May", sales: 2390 * multiplier, profit: 950 * multiplier },
      { name: "Jun", sales: 3490 * multiplier, profit: 1400 * multiplier },
      { name: "Jul", sales: 4100 * multiplier, profit: 1650 * multiplier }, // Added more data
      { name: "Aug", sales: 3800 * multiplier, profit: 1500 * multiplier },
    ],
  }
}

// Helper to format currency
const formatCurrency = (value: string) => {
  return `₹${parseInt(value).toLocaleString("en-IN")}`
}

// Reusable KPI Card Component
const KPICard = ({ title, value, trendValue, trendPositive, trendContext, isCurrency, isPercent }: KpiData) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
      {trendPositive ? 
        <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" /> : 
        <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
      }
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {isCurrency ? formatCurrency(value) : value}{isPercent ? "%" : ""}
      </div>
      <p className={`text-xs flex items-center ${trendPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        {trendValue}% {trendContext}
      </p>
    </CardContent>
  </Card>
)

// Function to trigger file download simulation
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

export default function VendorAnalyticsPage() {
  const [date, setDate] = useState<Date>(new Date(2025, 3, 14)) // April 14th, 2025
  const [reportType, setReportType] = useState<string>("traffic") // Default to Traffic as per screenshot
  const [activeTab, setActiveTab] = useState<string>("Overview")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(generateMockData(activeTab))

  // Update data when tab changes (simulation)
  useEffect(() => {
    setAnalyticsData(generateMockData(activeTab))
  }, [activeTab])

  // Updated export handler to simulate download
  const handleExport = (type: "pdf" | "excel") => {
    if (type === "pdf") {
      console.log("Simulating PDF download...");
      downloadFile("analytics_report.txt", "Simulated PDF Report Content", "text/plain");
    } else if (type === "excel") {
      console.log("Simulating Excel/CSV download...");
      // Convert chart data to CSV format
      const headers = "Month,Sales,Profit\n";
      const rows = analyticsData.chartData.map(d => `${d.name},${d.sales},${d.profit}`).join("\n");
      const csvContent = headers + rows;
      downloadFile("analytics_data.csv", csvContent, "text/csv;charset=utf-8;");
    }
  }

  return (
    <div className="animate-fadeIn p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Page Title - Adjusted from screenshot as title usually isn't part of the page content itself */} 
      {/* <h1 className="text-2xl font-semibold mb-6">Analytics & Reports</h1> */} 
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Analytics Dashboard</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Overview Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[140px] justify-between bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[140px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              {["overview", "sales", "profit", "traffic"].map((type) => (
                <DropdownMenuItem 
                  key={type} 
                  onSelect={() => setReportType(type)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {reportType === type && <Check className="ml-auto h-4 w-4 text-green-500" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              <DropdownMenuItem 
                onSelect={() => handleExport("pdf")} 
                className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => handleExport("excel")} 
                className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Excel (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs & Real-time Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-gray-200 dark:bg-gray-700/50 rounded-lg p-1">
            {["Overview", "Monthly", "Weekly", "Hourly", "Peak Hours"].map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="px-4 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-800/60 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-200 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/40">
          <Signal className="h-3 w-3 mr-1 animate-pulse text-green-500 dark:text-green-300" />
          Real-time updates active
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {analyticsData.kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Sales Overview Chart */}
      <Card className="shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Sales Overview</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sales and profit comparison for the selected period ({activeTab})</p>
        </CardHeader>
        <CardContent className="h-[350px] w-full p-2 md:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
               <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/> 
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${value/1000}k`} 
              />
              <Tooltip 
                 contentStyle={{ 
                   backgroundColor: 'hsl(var(--background) / 0.9)', 
                   border: '1px solid hsl(var(--border))', 
                   borderRadius: 'var(--radius)',
                   boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                 }} 
                 labelStyle={{ color: 'hsl(var(--foreground))' }}
                 itemStyle={{ color: 'hsl(var(--foreground))' }}
                 cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
              <Area type="monotone" dataKey="profit" stroke="#8884d8" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 