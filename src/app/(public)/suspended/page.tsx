import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-orange-100 rounded-full p-4 mb-4">
        <Ban className="h-12 w-12 text-orange-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Your account has been suspended. If you believe this is a mistake,
        please contact our support team.
      </p>
      <div className="flex gap-3">
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
        <a href="mailto:support@krishihat.com">
          <Button>Contact Support</Button>
        </a>
      </div>
    </div>
  );
}