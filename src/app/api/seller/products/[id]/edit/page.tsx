"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations/product.schema";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { CheckCircle, Package, ShoppingBag, Gavel, MessageSquare, BarChart2, User, BadgeCheck, FileText, Trash2 } from "lucide-react";

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

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
  });

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data); });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${params.id}`).then((r) => r.json()),
      fetch(`/api/products/${params.id}/images`).then((r) => r.json()),
    ]).then(([productJson, imagesJson]) => {
      if (productJson.success) {
        const p = productJson.data;
        setProduct(p);
        reset({
          title: p.title || "",
          titleBn: p.titleBn || "",
          categoryId: p.categoryId || "",
          subcategoryId: p.subcategoryId || "",
          description: p.description || "",
          price: Number(p.price),
          stock: p.stock,
          unit: p.unit,
          condition: p.condition,
          listingType: p.listingType,
        });
      }
      if (imagesJson.success) setImages(imagesJson.data);
    }).finally(() => setLoadingProduct(false));
  }, [params.id, reset]);

  const onSubmit = async (data: ProductInput) => {
    setServerError(null);
    setSaved(false);
    const res = await fetch(`/api/products/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setServerError(json.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setImageUploading(true);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("image", f));
    const res = await fetch(`/api/products/${params.id}/images`, { method: "POST", body: form });
    const json = await res.json();
    if (json.success) {
      const refreshed = await fetch(`/api/products/${params.id}/images`).then((r) => r.json());
      if (refreshed.success) setImages(refreshed.data);
    }
    setImageUploading(false);
    e.target.value = "";
  };

  const handleDeleteImage = async (imageId: string) => {
    await fetch(`/api/products/${params.id}/images/${imageId}`, { method: "DELETE" });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSetPrimary = async (imageId: string) => {
    await fetch(`/api/products/${params.id}/images/${imageId}`, { method: "PATCH" });
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
  };

  if (loadingProduct) {
    return (
      <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={sellerLinks} sidebarTitle="Seller Panel">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <SectionHeader title="Edit Product" />
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Images */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Product Images</h3>
            <div className="flex flex-wrap gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt="" className="h-20 w-20 object-cover rounded-lg border" />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">Primary</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    {!img.isPrimary && (
                      <button onClick={() => handleSetPrimary(img.id)} className="text-white text-xs bg-primary px-1.5 py-0.5 rounded">
                        Set Primary
                      </button>
                    )}
                    <button onClick={() => handleDeleteImage(img.id)} className="text-white">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <label className="h-20 w-20 border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <span className="text-2xl text-muted-foreground">{imageUploading ? "..." : "+"}</span>
                <span className="text-xs text-muted-foreground">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Product form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Product Title (English)" error={errors.title?.message} {...register("title")} />
              <Input label="Product Title (Bengali)" placeholder="বাংলায় নাম (ঐচ্ছিক)" {...register("titleBn")} />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Category *</label>
                  <select {...register("categoryId")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                </div>
                {selectedCategory?.subcategories?.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Subcategory</label>
                    <select {...register("subcategoryId")} className="h-10 px-3 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select subcategory</option>
                      {selectedCategory.subcategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                    {["kg", "g", "piece", "dozen", "liter", "bundle", "bag"].map((u) => <option key={u} value={u}>{u}</option>)}
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
                />
              </div>

              {saved && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md text-sm">
                  <CheckCircle className="h-4 w-4" /> Product updated successfully!
                </div>
              )}
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}