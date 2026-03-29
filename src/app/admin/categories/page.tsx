"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validations/category.schema";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  Users, Package, ShoppingBag, CreditCard, Tag,
  TrendingUp, Truck, AlertCircle, ClipboardList, Edit, Trash2,
} from "lucide-react";

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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  const {
    register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const onCreateSubmit = async (data: CategoryInput) => {
    setServerError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      reset();
      setIsCreateOpen(false);
      fetchCategories();
    } else {
      setServerError(json.message);
    }
  };

  const onEditSubmit = async (data: CategoryInput) => {
    setServerError(null);
    const res = await fetch(`/api/categories/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setEditTarget(null);
      fetchCategories();
    } else {
      setServerError(json.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products in this category will not be deleted but won't be visible.")) return;
    setDeleting(id);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeleting(null);
    fetchCategories();
  };

  const openEdit = (cat: any) => {
    setEditTarget(cat);
    setServerError(null);
    resetEdit({
      name: cat.name,
      nameBn: cat.nameBn,
      slug: cat.slug,
      auctionAllowed: cat.auctionAllowed,
      sortOrder: cat.sortOrder,
    });
  };

  const CategoryForm = ({
    onSubmit, reg, errs, submitting, submitLabel,
  }: {
    onSubmit: any; reg: any; errs: any; submitting: boolean; submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Name (English)" error={errs.name?.message} {...reg("name")} />
        <Input label="Name (Bengali)" placeholder="বাংলায় নাম" error={errs.nameBn?.message} {...reg("nameBn")} />
      </div>
      <Input label="Slug" placeholder="e.g. fresh-vegetables" error={errs.slug?.message} {...reg("slug")} />
      <Input label="Sort Order" type="number" defaultValue={0} {...reg("sortOrder")} />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...reg("auctionAllowed")} className="h-4 w-4 rounded" />
        <span className="text-sm font-medium">Allow Auction Listings</span>
      </label>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" isLoading={submitting} className="w-full">{submitLabel}</Button>
    </form>
  );

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        action={<Button size="sm" onClick={() => { setIsCreateOpen(true); setServerError(null); reset(); }}>+ Add Category</Button>}
      />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : categories.length === 0 ? (
        <EmptyState icon={<Tag className="h-12 w-12" />} title="No categories yet" action={<Button onClick={() => setIsCreateOpen(true)}>Add First Category</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Name (EN)", "Name (BN)", "Slug", "Sort", "Auction", "Subcategories", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-bengali">{cat.nameBn}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 text-center">{cat.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.auctionAllowed ? "success" : "outline"} className="text-xs">
                      {cat.auctionAllowed ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                    {cat.subcategories?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(cat)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2"
                        isLoading={deleting === cat.id}
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Category">
        <CategoryForm
          onSubmit={handleSubmit(onCreateSubmit)}
          reg={register}
          errs={errors}
          submitting={isSubmitting}
          submitLabel="Create Category"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Category">
        <CategoryForm
          onSubmit={handleSubmitEdit(onEditSubmit)}
          reg={registerEdit}
          errs={editErrors}
          submitting={editSubmitting}
          submitLabel="Save Changes"
        />
      </Modal>
    </DashboardLayout>
  );
}