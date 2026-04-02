"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Tag,
  TrendingUp,
  Truck,
  AlertCircle,
  ClipboardList,
  Search,
  RefreshCw,
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

type Product = {
  id: string;
  title: string;
  price: number | string;
  stock: number;
  status: "draft" | "active" | "inactive" | "rejected" | string;
  images?: { url: string }[];
  category?: {
    name?: string;
  } | null;
  seller?: {
    sellerProfile?: {
      shopName?: string;
    } | null;
  } | null;
};

const statusVariant: Record<string, any> = {
  draft: "warning",
  active: "success",
  inactive: "default",
  rejected: "destructive",
};

const PRODUCT_STATUSES = ["", "draft", "active", "inactive", "rejected"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("limit", "500");

      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success) {
        const items = json.data?.items || [];
        setProducts(items);
        setTotal(json.data?.total || items.length);
      } else {
        setProducts([]);
        setTotal(0);
      }
    } catch (error) {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, rowsPerPage]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const previousProducts = products;

    try {
      setUpdating(id);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, status: newStatus } : product
        )
      );

      const res = await fetch(`/api/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setProducts(previousProducts);
        return;
      }

      fetchProducts();
    } catch (error) {
      setProducts(previousProducts);
    } finally {
      setUpdating(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!searchQuery) return true;

      const q = searchQuery.toLowerCase();

      return (
        product.title?.toLowerCase().includes(q) ||
        product.category?.name?.toLowerCase().includes(q) ||
        product.seller?.sellerProfile?.shopName?.toLowerCase().includes(q) ||
        product.status?.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout sidebarLinks={adminLinks} sidebarTitle="Admin Panel">
      <SectionHeader title="Products" subtitle={`${filteredProducts.length} products`} />

      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchQuery(search.trim())}
            placeholder="Search products, seller, category, status..."
            className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button size="sm" onClick={() => setSearchQuery(search.trim())}>
          Search
        </Button>

        {(searchQuery || statusFilter) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearch("");
              setSearchQuery("");
              setStatusFilter("");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Show
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
          </select>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchProducts}
          className="ml-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {PRODUCT_STATUSES.map((status) => (
          <Button
            key={status || "all"}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className="capitalize text-xs"
          >
            {status || "All"}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Showing {paginatedProducts.length} of {filteredProducts.length} filtered products
        {statusFilter ? ` (${statusFilter})` : ` from ${total} total`}
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No products found"
          description={
            statusFilter === "draft"
              ? "No products pending review."
              : "No products match this filter."
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Product", "Seller", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left font-medium text-muted-foreground text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 m-auto mt-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="font-medium text-xs truncate max-w-[180px]">
                          {product.title}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {product.seller?.sellerProfile?.shopName || "—"}
                    </td>

                    <td className="px-3 py-3 text-xs">
                      {product.category?.name || "—"}
                    </td>

                    <td className="px-3 py-3 font-bold text-primary text-xs">
                      ৳{Number(product.price || 0).toFixed(2)}
                    </td>

                    <td className="px-3 py-3 text-xs">
                      {product.stock ?? 0}
                    </td>

                    <td className="px-3 py-3">
                      <Badge
                        variant={statusVariant[product.status] || "default"}
                        className="text-xs capitalize"
                      >
                        {product.status}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {product.status !== "active" && (
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs"
                            disabled={updating === product.id}
                            onClick={() => handleStatusChange(product.id, "active")}
                          >
                            {updating === product.id ? "Updating..." : "Approve"}
                          </Button>
                        )}

                        {product.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 px-2 text-xs"
                            disabled={updating === product.id}
                            onClick={() => handleStatusChange(product.id, "rejected")}
                          >
                            {updating === product.id ? "Updating..." : "Reject"}
                          </Button>
                        )}

                        {product.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            disabled={updating === product.id}
                            onClick={() => handleStatusChange(product.id, "inactive")}
                          >
                            {updating === product.id ? "Updating..." : "Deactivate"}
                          </Button>
                        )}

                        {product.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            disabled={updating === product.id}
                            onClick={() => handleStatusChange(product.id, "draft")}
                          >
                            {updating === product.id ? "Updating..." : "Move to Draft"}
                          </Button>
                        )}

                        {product.status === "inactive" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            disabled={updating === product.id}
                            onClick={() => handleStatusChange(product.id, "active")}
                          >
                            {updating === product.id ? "Updating..." : "Reactivate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-center">
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-9 h-9 px-3 rounded-md border text-sm transition-colors bg-background border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-9 h-9 px-3 rounded-md border text-sm transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-w-9 h-9 px-3 rounded-md border text-sm transition-colors bg-background border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Page - 1</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}