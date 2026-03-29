import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ban, Mail } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8 space-y-5">
          <div className="flex justify-center">
            <div className="bg-destructive/10 rounded-full p-5">
              <Ban className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Account Suspended
            </h1>
            <p className="text-muted-foreground text-sm">
              Your account has been temporarily suspended. You cannot access
              KrishiHat until the suspension is lifted.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-left space-y-1.5">
            <p className="font-medium text-foreground">What to do next:</p>
            <p>• Contact our support team to understand the reason</p>
            <p>• Provide any required information or documentation</p>
            <p>• Wait for the admin team to review your account</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span>
              Email us at{" "}
              <a
                href="mailto:support@krishihat.com"
                className="text-primary hover:underline"
              >
                support@krishihat.com
              </a>
            </span>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}