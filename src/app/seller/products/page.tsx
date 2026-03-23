"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations/product.schema";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart2, Package, ShoppingBag, Gavel, MessageSquare, User, BadgeCheck, FileText } from "lucide-react";

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/seller/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/seller/auctions", label: "Auctions", icon: <Gavel className="h-4 w-4" /> },
  { href: "/seller/orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/seller/quotes", label: "Quotes", icon: <FileText className="h-4 w-4" /> },
  { href: "/seller/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/seller/verification", label: "Verification", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/seller/profile", label: "Shop Profile", icon: <User className="h-4 w-4" /> },
  { href: "/seller/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
];

export default function NewProductPage() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { condition: "new", listingType: "fixed", unit: "kg", stock: 1 },
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data); });
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const onSubmit = async (data: ProductInput) => {
    setServerError(null);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      router.push(`/seller/products`);
    } else {
      setServerError(json.message);
    }
  };

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <SectionHeader title="Add New Product" />
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Product Title (English)" error={errors.title?.message} {...register("title")} />
            <Input label="Product Title (Bengali)" placeholder="বাংলায় নাম (ঐচ্ছিক)" {...register("titleBn")} />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Category *</label>
                <select {...register("categoryId")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
              </div>

              {selectedCategory?.subcategories?.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Subcategory</label>
                  <select {...register("subcategoryId")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select subcategory</option>
                    {selectedCategory.subcategories.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Price (৳)" type="number" step="0.01" error={errors.price?.message} {...register("price")} />
              <Input label="Stock" type="number" error={errors.stock?.message} {...register("stock")} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Unit</label>
                <select {...register("unit")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {["kg", "g", "piece", "dozen", "liter", "bundle", "bag"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Condition</label>
                <select {...register("condition")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Listing Type</label>
                <select {...register("listingType")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="fixed">Fixed Price</option>
                  {selectedCategory?.auctionAllowed && <option value="auction">Auction</option>}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Describe your product..."
              />
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSubmitting}>Create Product</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}