"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PrescriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/prescriptions")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          setPrescriptions(data);
        }
      })
      .catch(() => toast.error("Failed to load prescriptions"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        Prescriptions
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && prescriptions.length === 0 && <p>No prescriptions found.</p>}

      {!loading && prescriptions.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: 8, textAlign: "left" }}>Doctor</th>
              <th style={{ padding: 8, textAlign: "left" }}>Patient</th>
              <th style={{ padding: 8, textAlign: "left" }}>Items</th>
              <th style={{ padding: 8, textAlign: "left" }}>Date</th>
            </tr>
          </thead>

          <tbody>
            {prescriptions.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{p.doctorName || "—"}</td>
                <td style={{ padding: 8 }}>{p.patientName || "—"}</td>
                <td style={{ padding: 8 }}>
                  {p.saleItems.length > 0
                    ? p.saleItems.map((item: any) => (
                        <div key={item.id}>
                          {item.medicine?.name} — Qty: {item.quantity}
                        </div>
                      ))
                    : "No items"}
                </td>
                <td style={{ padding: 8 }}>
                  {new Date(p.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
