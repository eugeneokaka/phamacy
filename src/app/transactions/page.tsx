"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type SaleItemType = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medicine: { name: string };
  batch: { batchNumber: number };
};

type SaleType = {
  id: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  items: SaleItemType[];
};

export default function TransactionsPage() {
  const [sales, setSales] = useState<SaleType[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (batchNumber) params.append("batchNumber", batchNumber);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch transactions");
        return;
      }

      setSales(data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Debounce: fetch 500ms AFTER user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSales();
    }, 500);

    return () => clearTimeout(handler);
  }, [search, batchNumber, startDate, endDate]);

  // Initial load
  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 1000 }}>
      <h1>Transactions</h1>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <input
          type="text"
          placeholder="Search medicine name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8 }}
        />

        <input
          type="text"
          placeholder="Batch number"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          style={{ padding: 8 }}
        />

        <input
          type="date"
          placeholder="Start date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: 8 }}
        />

        <input
          type="date"
          placeholder="End date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: 8 }}
        />
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : sales.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 6 }}>Date</th>
              <th style={{ textAlign: "left", padding: 6 }}>User</th>
              <th style={{ textAlign: "left", padding: 6 }}>Medicine</th>
              <th style={{ textAlign: "left", padding: 6 }}>Batch #</th>
              <th style={{ textAlign: "left", padding: 6 }}>Qty</th>
              <th style={{ textAlign: "left", padding: 6 }}>Unit Price</th>
              <th style={{ textAlign: "left", padding: 6 }}>Total Price</th>
              <th style={{ textAlign: "left", padding: 6 }}>Payment</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) =>
              sale.items.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 6 }}>
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: 6 }}>
                    {sale.user.firstName} {sale.user.lastName}
                  </td>
                  <td style={{ padding: 6 }}>{item.medicine.name}</td>
                  <td style={{ padding: 6 }}>{item.batch?.batchNumber}</td>
                  <td style={{ padding: 6 }}>{item.quantity}</td>
                  <td style={{ padding: 6 }}>{item.unitPrice}</td>
                  <td style={{ padding: 6 }}>{item.totalPrice}</td>
                  <td style={{ padding: 6 }}>{sale.paymentMethod || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
