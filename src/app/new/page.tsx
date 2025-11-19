"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

// ✅ Define a proper type for each medicine
type Medicine = {
  name: string;
  genericName: string;
  category: string;
  description: string;
  sellingPrice: string;
  expiryDate: string;
  costPrice: string;
  quantity: string;
};

export default function NewOrderPage() {
  const [supplier, setSupplier] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      name: "",
      genericName: "",
      category: "",
      description: "",
      sellingPrice: "",
      expiryDate: "",
      costPrice: "",
      quantity: "",
    },
  ]);

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        name: "",
        genericName: "",
        category: "",
        description: "",
        sellingPrice: "",
        expiryDate: "",
        costPrice: "",
        quantity: "",
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Fix TypeScript error using keyof Medicine
  const handleMedicineChange = (
    index: number,
    field: keyof Medicine,
    value: string
  ) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier,
          totalCost: parseFloat(totalCost) || 0,
          medicines: medicines.map((m) => ({
            ...m,
            sellingPrice: parseFloat(m.sellingPrice) || 0,
            costPrice: parseFloat(m.costPrice) || 0,
            quantity: parseInt(m.quantity) || 0,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create order");
      } else {
        toast.success("Order created successfully!");
        setSupplier("");
        setTotalCost("");
        setMedicines([
          {
            name: "",
            genericName: "",
            category: "",
            description: "",
            sellingPrice: "",
            expiryDate: "",
            costPrice: "",
            quantity: "",
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">New Order</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Supplier Name</Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g., MedSupply Ltd"
                  required
                />
              </div>
              <div>
                <Label>Total Cost</Label>
                <Input
                  type="number"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  placeholder="Total cost of order"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Medicines</h3>
              {medicines.map((m, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 relative"
                >
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={m.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Generic Name</Label>
                      <Input
                        value={m.genericName}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "genericName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={m.category}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "category",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={m.description}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Selling Price</Label>
                      <Input
                        type="number"
                        value={m.sellingPrice}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "sellingPrice",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Cost Price</Label>
                      <Input
                        type="number"
                        value={m.costPrice}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "costPrice",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={m.quantity}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={m.expiryDate}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddMedicine}
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Add Medicine
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Order...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
