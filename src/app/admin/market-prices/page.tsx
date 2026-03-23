"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { marketPriceSchema, type MarketPriceInput } from "@/lib/validations/market-price.schema";
import { Users, Package, ShoppingBag, CreditCard, Tag, TrendingUp, Truck, AlertCircle, ClipboardList } from "lucide-react";
import { format } from "date-fns";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/sellers", label: "Sellers", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/categories", label: "Categories", icon: <Tag className="h-4 w-4" /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/logistics", label: "Logistics", icon: <Truck className="h-4 w-4" /> },
  { href: "/admin/market-prices", label: "Market Prices", icon: <TrendingUp className="h-4 w-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <AlertCircle className="h-4 w-4" /> },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: <ClipboardList className="h-4 w-4" /> },
];

export default function AdminMarketPricesPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MarketPriceInput>({
    resolver: zodResolver(marketPriceSchema),
  });

  const fetchRecords = () => {
    fetch("/api/market-prices?limit=100")
      .then((r) => r.json())
      .then((json) => { if (json.success) setRecords(json.data.items); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data); });
  }, []);

  const onSubmit = async (data: MarketPriceInput) => {
    const res = await fetch("/api/market-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      setIsModalOpen(false);
      fetchRecords();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this price record?")) return;
    await fetch(`/api/market-prices/${id}`, { method: "DELETE" });
    fetchRecords();
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader
        title="Market Prices"
        subtitle="Daily commodity price management"
        action={<Button size="sm" onClick={() => setIsModalOpen(true)}>+ Add Price</Button>}
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Product", "Category", "Min ৳", "Max ৳", "Unit", "Market", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No records found</td></tr>
              ) : records.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.category?.name}</td>
                  <td className="px-4 py-3 text-green-700">৳ {r.minPrice}</td>
                  <td className="px-4 py-3 text-red-700">৳ {r.maxPrice}</td>
                  <td className="px-4 py-3">{r.unit}</td>
                  <td className="px-4 py-3">{r.market}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.recordedAt), "dd MMM")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(r.id)} className="text-destructive text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Market Price">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Category *</label>
            <select {...register("categoryId")} className="h-10 px-3 rounded-md border border-input text-sm">
              <option value="">Select category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>
          <Input label="Product Name" error={errors.productName?.message} {...register("productName")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Price (৳)" type="number" step="0.01" error={errors.minPrice?.message} {...register("minPrice")} />
            <Input label="Max Price (৳)" type="number" step="0.01" error={errors.maxPrice?.message} {...register("maxPrice")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Unit" defaultValue="kg" {...register("unit")} />
            <Input label="Market Name" placeholder="e.g. Karwan Bazar" error={errors.market?.message} {...register("market")} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">Save</Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}