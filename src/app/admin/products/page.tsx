"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  Users, Package, ShoppingBag, CreditCard, Tag,
  TrendingUp, Truck, AlertCircle, ClipboardList, Search,
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

const statusVariant: Record<string, any> = {
  draft: "warning", active: "success", inactive: "default", rejected: "danger",
};

const PRODUCT_STATUSES = ["", "draft", "active", "inactive", "rejected"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("draft");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (statusFilter) params.set("status", statusFilter);
    if (searchQuery) params.set("q", searchQuery);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setProducts(json.data.items);
          setTotal(json.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [statusFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    fetchProducts();
  };

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Products" subtitle={`${total} products`} />

      {/* Search */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(search)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={() => setSearchQuery(search)}>Search</Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {PRODUCT_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="capitalize text-xs"
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No products found"
          description={statusFilter === "draft" ? "No products pending review." : "No products match this filter."}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Product", "Seller", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 m-auto mt-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium text-xs truncate max-w-[130px]">{product.title}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {product.seller?.sellerProfile?.shopName || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">{product.category?.name}</td>
                  <td className="px-3 py-3 font-bold text-primary text-xs">৳{Number(product.price).toFixed(2)}</td>
                  <td className="px-3 py-3 text-xs">{product.stock}</td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant[product.status] || "default"} className="text-xs capitalize">
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {product.status !== "active" && (
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          isLoading={updating === product.id}
                          onClick={() => handleStatusChange(product.id, "active")}
                        >
                          Approve
                        </Button>
                      )}
                      {product.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 px-2 text-xs"
                          isLoading={updating === product.id}
                          onClick={() => handleStatusChange(product.id, "rejected")}
                        >
                          Reject
                        </Button>
                      )}
                      {product.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          isLoading={updating === product.id}
                          onClick={() => handleStatusChange(product.id, "inactive")}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}