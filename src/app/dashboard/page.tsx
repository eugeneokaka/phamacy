"use client";

import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data, error } = useSWR("/api/dashboard", fetcher);

  if (error) return <div>Error loading data</div>;
  if (!data) return <div>Loading...</div>;

  // Prepare data for charts
  const mostSoldData = data.mostSold.map((item: any) => ({
    name: item.medicine?.name || "Unknown",
    quantity: item._sum.quantity,
  }));

  const leastSoldData = data.leastSold.map((item: any) => ({
    name: item.medicine?.name || "Unknown",
    quantity: item._sum.quantity,
  }));

  const mostExpensiveData = data.mostExpensive.map((item: any) => ({
    name: item.name,
    price: item.sellingPrice,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Most Sold Medicines */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Sold Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mostSoldData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Least Sold Medicines */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Least Sold Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leastSoldData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#e11d48" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Expensive Medicines */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Expensive Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mostExpensiveData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="price" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
