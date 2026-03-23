import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageContainer>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <Skeleton className="h-80 w-full rounded-lg" />

        {/* Details */}
        <div className="space-y-4">
          <Badge variant="success">In Stock</Badge>
          <h1 className="text-2xl font-bold">Product: {params.slug}</h1>
          <p className="text-muted-foreground">Product description will appear here.</p>
          <div className="text-3xl font-bold text-primary">৳ 0.00</div>
          <div className="flex gap-3">
            <Button className="flex-1">Add to Cart</Button>
            <Button variant="outline" className="flex-1">Buy Now</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}