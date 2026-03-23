import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Sprout className="h-16 w-16 text-primary mb-4 opacity-50" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/"><Button>Go Home</Button></Link>
    </div>
  );
}