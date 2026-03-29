import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-destructive/10 rounded-full p-6 mb-6">
        <ShieldX className="h-16 w-16 text-destructive" />
      </div>

      <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
      <h2 className="text-lg text-muted-foreground mb-3">
        You don&apos;t have permission to view this page.
      </h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm">
        This page requires a different role or higher permissions.
        Please log in with an appropriate account.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
        <Link href="/login">
          <Button>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </Link>
      </div>
    </div>
  );
}