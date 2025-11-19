"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type MedicineWithBatches = {
  medicine: any;
  remainingStock: number;
  lowStock: boolean;
};

export default function MedicineSalePage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<MedicineWithBatches | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // LOAD MEDICINE + BATCHES
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`/api/sales/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          toast.error(json.error);
          return;
        }

        setData(json);

        if (!json.medicine.batches || json.medicine.batches.length === 0) {
          toast.error("No available batches for this medicine");
          return;
        }

        const firstBatch = json.medicine.batches[0];
        setSelectedBatchId(firstBatch.id);
      })
      .catch(() => toast.error("Failed to load medicine"))
      .finally(() => setLoading(false));
  }, [id]);

  // CREATE SALE
  const handleSell = async () => {
    if (!selectedBatchId) return toast.error("Select a batch");
    if (quantity <= 0) return toast.error("Quantity must be > 0");

    setSubmitting(true);

    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatchId,
          quantity,
          paymentMethod,
          customerId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Sale failed");
        return;
      }

      toast.success(
        `Sale created (id: ${json.sale.id}). Remaining stock: ${
          json.remainingStock
        }${json.lowStock ? " — LOW STOCK" : ""}`
      );

      const next = await fetch(`/api/sales/${id}`).then((r) => r.json());
      setData(next);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error creating sale");
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) return <div>Invalid page (missing ID)</div>;

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>Sales — Medicine</h1>

      {loading && <p>Loading medicine...</p>}

      {!loading && data && (
        <>
          {/* Medicine Info */}
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 8,
            }}
          >
            <h2>{data.medicine.name}</h2>
            <div>Generic: {data.medicine.genericName || "—"}</div>
            <div>Category: {data.medicine.category || "—"}</div>
            <div>Selling price: {data.medicine.sellingPrice}</div>
            <div>Reorder level: {data.medicine.reorderLevel}</div>

            <div style={{ marginTop: 8, fontWeight: 600 }}>
              Total stock: {data.remainingStock}{" "}
              {data.lowStock && <span style={{ color: "crimson" }}>— LOW</span>}
            </div>
          </div>

          {/* Batches Table */}
          <div style={{ marginBottom: 20 }}>
            <h3>Available Batches</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Select</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Batch #</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Expiry</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Qty</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.medicine.batches.map((b: any) => (
                  <tr key={b.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 6 }}>
                      <input
                        type="radio"
                        name="batch"
                        checked={selectedBatchId === b.id}
                        onChange={() => setSelectedBatchId(b.id)}
                      />
                    </td>
                    <td style={{ padding: 6 }}>{b.batchNumber}</td>
                    <td style={{ padding: 6 }}>
                      {new Date(b.expiryDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 6 }}>{b.quantity}</td>
                    <td style={{ padding: 6 }}>{b.costPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Make Sale */}
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 8,
            }}
          >
            <h3>Make a Sale</h3>

            {/* Quantity + Payment */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  style={{ padding: 8, width: "100%" }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ padding: 8, width: "100%" }}
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Mobile</option>
                </select>
              </div>
            </div>

            {/* Optional Customer ID */}
            <div style={{ marginTop: 8 }}>
              <label>Customer ID (optional)</label>
              <input
                value={customerId || ""}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="customer id"
                style={{ padding: 8, width: "100%" }}
              />
            </div>

            {/* Submit */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={handleSell}
                disabled={submitting}
                style={{
                  padding: "10px 16px",
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
                className="bg-black text-white p-2 rounded-2xl"
              >
                {submitting ? "Processing sale..." : "Sell"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
