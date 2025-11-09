"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Medicine {
  id: string;
  name: string;
  category?: string;
  description?: string;
  sellingPrice: number | string;
  expiryDate?: string;
  reorderLevel: number;
  totalQty: number;
  isLowStock: boolean;
  isExpiringSoon: boolean;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    expiryDate: "",
    filterMode: "all",
  });
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchMedicines = async () => {
    const query = new URLSearchParams(
      filters as Record<string, string>
    ).toString();

    const res = await fetch(`/api/medicines?${query}`);
    const data = await res.json();

    const formatted = data.map((med: Medicine) => ({
      ...med,
      sellingPrice: Number(med.sellingPrice),
    }));

    setMedicines(formatted);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(fetchMedicines, 400);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Medicine Inventory</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <Label>Name</Label>
          <Input
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Search by name"
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input
            name="category"
            value={filters.category}
            onChange={handleChange}
            placeholder="Search category"
          />
        </div>

        <div>
          <Label>Expiry Before</Label>
          <Input
            type="date"
            name="expiryDate"
            value={filters.expiryDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Status Filter</Label>
          <Select
            value={filters.filterMode}
            onValueChange={(value) =>
              setFilters({ ...filters, filterMode: value })
            }
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-md">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-md shadow-md">
              <SelectItem value="all">All Medicines</SelectItem>
              <SelectItem value="lowStock">Low Stock (Qty &lt; 10)</SelectItem>
              <SelectItem value="expiringSoon">
                Expiring Soon (≤ 30 days)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={fetchMedicines}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full shadow-md"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Expiry Date</th>
              <th className="px-4 py-3 text-left">Selling Price</th>
              <th className="px-4 py-3 text-left">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {medicines.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No medicines found
                </td>
              </tr>
            ) : (
              medicines.map((med) => {
                const rowColor = med.isLowStock
                  ? "bg-red-100"
                  : med.isExpiringSoon
                  ? "bg-yellow-100"
                  : "bg-white";

                return (
                  <tr
                    key={med.id}
                    className={`${rowColor} border-b hover:bg-gray-50 transition`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {med.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {med.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {med.expiryDate
                        ? new Date(med.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-semibold">
                      {Number(med.sellingPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {med.totalQty}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
