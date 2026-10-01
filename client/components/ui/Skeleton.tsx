import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A single pulsing placeholder block - compose into content-shaped skeletons (see SkeletonText below) instead of a bare spinner for anything that loads shaped content (summaries, document lists, lesson text). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

/** A paragraph-shaped placeholder - last line shorter, like real wrapped text. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
