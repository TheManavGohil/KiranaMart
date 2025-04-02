"use client"

import type React from "react"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, Package } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  bgColor?: string
}

const StatsCard = ({ title, value, icon, trend, bgColor = "bg-white" }: StatsCardProps) => (
  <div className={`${bgColor} p-6 rounded-lg shadow-md`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="font-bold text-2xl mt-1">{value}</h3>

        {trend && (
          <p className={`flex items-center text-sm mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {trend.value}% from last month
          </p>
        )}
      </div>
      <div className="p-3 rounded-full bg-green-100 text-green-600">{icon}</div>
    </div>
  </div>
)

interface DashboardStatsProps {
  data?: {
    revenue: number
    orders: number
    customers: number
    products: number
    salesData: {
      name: string
      sales: number
    }[]
  }
}

const DashboardStats = ({ data }: DashboardStatsProps) => {
  // Default data if none provided
  const defaultData = {
    revenue: 4890,
    orders: 234,
    customers: 89,
    products: 45,
    salesData: [
      { name: "Jan", sales: 3000 },
      { name: "Feb", sales: 2000 },
      { name: "Mar", sales: 2780 },
      { name: "Apr", sales: 1890 },
      { name: "May", sales: 2390 },
      { name: "Jun", sales: 3490 },
    ],
  }

  const stats = data || defaultData

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        icon={<DollarSign className="w-6 h-6" />}
        trend={{ value: 12.5, isPositive: true }}
      />

      <StatsCard
        title="Total Orders"
        value={stats.orders.toString()}
        icon={<ShoppingBag className="w-6 h-6" />}
        trend={{ value: 8.2, isPositive: true }}
      />

      <StatsCard
        title="Total Customers"
        value={stats.customers.toString()}
        icon={<Users className="w-6 h-6" />}
        trend={{ value: 5.1, isPositive: true }}
      />

      <StatsCard
        title="Active Products"
        value={stats.products.toString()}
        icon={<Package className="w-6 h-6" />}
        trend={{ value: 2.3, isPositive: false }}
      />

      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-4">Monthly Sales</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats

