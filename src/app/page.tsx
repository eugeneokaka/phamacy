"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  description?: string;
  sellingPrice: number | string;
  expiryDate?: string;
  reorderLevel: number;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    expiryDate: "",
  });

  // debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchMedicines = async () => {
    const query = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    const res = await fetch(`/api/medicines?${query}`);
    const data = await res.json();

    // ensure sellingPrice is a number
    const formatted = data.map((med: Medicine) => ({
      ...med,
      sellingPrice: Number(med.sellingPrice),
    }));

    setMedicines(formatted);
  };

  // fetch initially
  useEffect(() => {
    fetchMedicines();
  }, []);

  // debounce fetch when filters change
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      fetchMedicines();
    }, 500); // 500ms debounce

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Search Filters */}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            placeholder="Search by category"
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
        <div className="flex items-end">
          <Button
            type="button"
            onClick={fetchMedicines}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            Refresh
          </Button>
        </div>
      </form>

      {/* Medicines Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-md">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Expiry Date</th>
              <th className="border px-4 py-2">Selling Price</th>
              <th className="border px-4 py-2">Reorder Level</th>
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
              medicines.map((med) => (
                <tr key={med.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{med.name}</td>
                  <td className="border px-4 py-2">{med.category || "-"}</td>
                  <td className="border px-4 py-2">
                    {med.expiryDate
                      ? new Date(med.expiryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">
                    {med.sellingPrice !== undefined && med.sellingPrice !== null
                      ? Number(med.sellingPrice).toFixed(2)
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">{med.reorderLevel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
