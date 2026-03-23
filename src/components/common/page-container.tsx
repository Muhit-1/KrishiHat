import { cn } from "@/lib/utils/cn";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn("page-container py-8", className)}>
      {children}
    </main>
  );
}