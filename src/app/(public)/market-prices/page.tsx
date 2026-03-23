import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";

export default function MarketPricesPage() {
  const placeholder = [
    { product: "Tomato", category: "Vegetables", min: 30, max: 50, unit: "kg", market: "Karwan Bazar", date: "2024-05-01" },
    { product: "Potato", category: "Vegetables", min: 25, max: 35, unit: "kg", market: "Karwan Bazar", date: "2024-05-01" },
    { product: "Miniket Rice", category: "Grains", min: 60, max: 75, unit: "kg", market: "Badamtoli", date: "2024-05-01" },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Market Prices"
        subtitle="Daily agricultural commodity prices across Bangladesh"
      />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["Product", "Category", "Min Price", "Max Price", "Unit", "Market", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {placeholder.map((row) => (
              <tr key={row.product} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{row.product}</td>
                <td className="px-4 py-3"><Badge variant="outline">{row.category}</Badge></td>
                <td className="px-4 py-3 text-green-700">৳ {row.min}</td>
                <td className="px-4 py-3 text-red-700">৳ {row.max}</td>
                <td className="px-4 py-3">{row.unit}</td>
                <td className="px-4 py-3">{row.market}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}