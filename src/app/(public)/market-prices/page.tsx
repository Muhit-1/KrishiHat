"use client";

import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/common/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { TrendingUp, Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useT } from "@/providers/locale-provider";

export default function MarketPricesPage() {
  const t = useT();
  const [records, setRecords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState<"productName" | "minPrice" | "maxPrice" | "recordedAt">("recordedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRecords = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (categoryFilter) params.set("category", categoryFilter);
    fetch(`/api/market-prices?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setRecords(json.data.items);
          setTotal(json.data.total);
          setLastUpdated(new Date());
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategories(json.data); });
  }, []);

  useEffect(() => { fetchRecords(); }, [categoryFilter]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, categoryFilter, sortField, sortDir, rowsPerPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    return records
      .filter((r) => {
        if (!searchQuery) return true;
        return (
          r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.market.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortField === "productName") return a.productName.localeCompare(b.productName) * dir;
        if (sortField === "minPrice") return (Number(a.minPrice) - Number(b.minPrice)) * dir;
        if (sortField === "maxPrice") return (Number(a.maxPrice) - Number(b.maxPrice)) * dir;
        return (new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()) * dir;
      });
  }, [records, searchQuery, sortDir, sortField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedRecords = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const SortButton = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 group">
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground"} group-hover:text-primary`} />
    </button>
  );

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-krishi-green to-krishi-green-light text-white py-10">
        <PageContainer>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-7 w-7" />
              <h1 className="text-3xl font-bold">{t("market_prices.title")}</h1>
            </div>
            <p className="text-white/80 text-lg">{t("market_prices.hero_sub")}</p>
            {lastUpdated && (
              <p className="text-white/60 text-sm mt-2 flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                {t("market_prices.last_updated")}: {format(lastUpdated, "dd MMM yyyy, hh:mm a")}
              </p>
            )}
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-8">
        <div className="flex gap-3 flex-wrap mb-5 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearchQuery(search)}
              placeholder={t("market_prices.search_placeholder")}
              className="w-full pl-9 pr-4 h-9 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button size="sm" onClick={() => setSearchQuery(search)}>{t("market_prices.search_btn")}</Button>
          {(searchQuery || categoryFilter) && (
            <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setSearchQuery(""); setCategoryFilter(""); setCurrentPage(1); }}>
              {t("market_prices.clear_filters")}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t("market_prices.show")}</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={75}>75</option>
            </select>
          </div>
          <Button size="sm" variant="outline" onClick={fetchRecords} className="ml-auto">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {t("market_prices.refresh")}
          </Button>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-5">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !categoryFilter ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted"
              }`}
            >
              {t("market_prices.all_categories")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id === categoryFilter ? "" : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  categoryFilter === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-3">
          {t("market_prices.showing")} {paginatedRecords.length} {t("market_prices.of")} {filtered.length} {t("market_prices.filtered_records")}
          {categoryFilter && ` ${t("market_prices.in")} ${categories.find((c) => c.id === categoryFilter)?.name}`}
        </p>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title={t("market_prices.no_records")}
            description={t("market_prices.no_records_desc")}
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
                      <SortButton field="productName" label={t("market_prices.product")} />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{t("market_prices.category")}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
                      <SortButton field="minPrice" label={t("market_prices.min_price")} />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
                      <SortButton field="maxPrice" label={t("market_prices.max_price")} />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{t("market_prices.avg_price")}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{t("market_prices.unit")}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{t("market_prices.market")}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
                      <SortButton field="recordedAt" label={t("market_prices.date")} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedRecords.map((record: any) => {
                    const avg = (Number(record.minPrice) + Number(record.maxPrice)) / 2;
                    return (
                      <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{record.productName}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{record.category?.name}</Badge>
                        </td>
                        <td className="px-4 py-3 text-green-700 font-semibold">৳ {Number(record.minPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-red-700 font-semibold">৳ {Number(record.maxPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-primary font-bold">৳ {avg.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{record.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{record.market}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {format(new Date(record.recordedAt), "dd MMM yyyy")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-center">
              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pg = index + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`min-w-9 h-9 px-3 rounded-md border text-sm transition-colors ${
                          currentPage === pg
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-input hover:bg-muted"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("market_prices.page")} - 1</p>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            {t("market_prices.legend_min")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            {t("market_prices.legend_max")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-primary/20 border border-primary/40 rounded" />
            {t("market_prices.legend_avg")}
          </span>
        </div>
      </PageContainer>
    </div>
  );
}