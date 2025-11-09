"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddMedicinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "",
    description: "",
    sellingPrice: "",
    expiryDate: "",
    quantity: "",
    costPrice: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create medicine");

      toast.success("Medicine and batch created successfully");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
      <div>
        <Label>Name</Label>
        <Input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div>
        <Label>Generic Name</Label>
        <Input
          name="genericName"
          value={form.genericName}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Category</Label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="">Select Category</option>
          <option value="Painkiller">Painkiller</option>
          <option value="Antibiotic">Antibiotic</option>
          <option value="Antihistamine">Antihistamine</option>
          <option value="Vitamin">Vitamin</option>
          <option value="Antacid">Antacid</option>
          <option value="Antidiabetic">Antidiabetic</option>
          <option value="Antihypertensive">Antihypertensive</option>
          <option value="Cold & Flu">Cold & Flu</option>
          <option value="Supplement">Supplement</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <Label>Description</Label>
        <Input
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Selling Price</Label>
        <Input
          name="sellingPrice"
          type="number"
          value={form.sellingPrice}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Expiry Date</Label>
        <Input
          name="expiryDate"
          type="date"
          value={form.expiryDate}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Quantity</Label>
        <Input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Cost Price</Label>
        <Input
          name="costPrice"
          type="number"
          value={form.costPrice}
          onChange={handleChange}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={`w-full ${
          loading ? "bg-gray-500" : "bg-purple-700 hover:bg-purple-800"
        } text-white`}
      >
        {loading ? "Creating..." : "Create Medicine"}
      </Button>
    </form>
  );
}
