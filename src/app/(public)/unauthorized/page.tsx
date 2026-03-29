import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-100 rounded-full p-4 mb-4">
        <ShieldX className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        You don&apos;t have permission to access this page.
        Please log in with an account that has the required role.
      </p>
      <div className="flex gap-3">
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
        <Link href="/login"><Button>Login</Button></Link>
      </div>
    </div>
  );
}