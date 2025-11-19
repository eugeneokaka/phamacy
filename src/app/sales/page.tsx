"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SalesPage() {
  const params = useParams();
  const router = useRouter();
  const { medicineId } = params;

  const [medicine, setMedicine] = useState<any>(null);
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/sales/${medicineId}`)
      .then((res) => res.json())
      .then((data) => setMedicine(data));
  }, [medicineId]);

  const handleSale = async () => {
    if (!batchId) return alert("Select a batch");
    setLoading(true);

    const res = await fetch(`/api/sales/${medicineId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "currentUserIdHere", // replace with auth user
        batchId,
        quantity: Number(quantity),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      alert("Sale successful");
      router.push("/"); // redirect to home
    } else {
      alert(data.error || "Sale failed");
    }
  };

  if (!medicine) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">{medicine.name}</h1>
      <p>Category: {medicine.category || "-"}</p>
      <p>Price: {medicine.sellingPrice}</p>
      <p>Total Quantity: {medicine.totalQty}</p>

      <div>
        <label className="block mb-1">Select Batch:</label>
        <Select value={batchId} onValueChange={setBatchId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a batch" />
          </SelectTrigger>
          <SelectContent>
            {medicine.batches.map((b: any) => (
              <SelectItem key={b.id} value={b.id}>
                Batch {b.batchNumber} - Qty: {b.quantity} - Exp:{" "}
                {new Date(b.expiryDate).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block mb-1">Quantity:</label>
        <Input
          type="number"
          min={1}
          max={1000}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <Button
        onClick={handleSale}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        {loading ? "Processing..." : "Sell"}
      </Button>
    </div>
  );
}
