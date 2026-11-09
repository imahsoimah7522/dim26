// ===========================================
// DataInsight Mini — Section Wrapper
// ===========================================
// Reusable section container for landing page.

import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("px-4 py-16 sm:px-6 sm:py-20 lg:px-8", className)}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
