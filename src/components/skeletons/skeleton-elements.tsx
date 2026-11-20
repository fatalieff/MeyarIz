import { cn } from "@/lib/utils";

export function SkeletonPulse({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn("animate-pulse rounded-lg bg-slate-200/80", className)}
    />
  );
}

export function SkeletonHeader({ titleWidth = "w-32" }: { titleWidth?: string }) {
  return (
    <div className="sticky top-0 z-30 flex h-16 md:h-[4.25rem] items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6 md:px-8">
      <div className="flex items-center gap-2">
        <SkeletonPulse className="hidden h-4 w-14 sm:block" />
        <span className="hidden text-slate-300 sm:inline">/</span>
        <SkeletonPulse className={`h-5 ${titleWidth}`} />
      </div>
      <div className="flex items-center gap-2.5">
        <SkeletonPulse className="hidden lg:block size-9 rounded-xl" />
        <SkeletonPulse className="hidden h-9 w-28 rounded-xl sm:block" />
        <div className="hidden lg:block h-5 w-px bg-slate-200/80 mx-0.5" />
        <SkeletonPulse className="size-9 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonPageHeader({
  hasButton = true,
}: {
  hasButton?: boolean;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="space-y-2.5">
        <SkeletonPulse className="h-4 w-24 rounded-full" />
        <SkeletonPulse className="h-8 w-60 sm:w-80" />
        <SkeletonPulse className="h-4 w-full max-w-lg" />
      </div>
      {hasButton && (
        <SkeletonPulse className="h-10 w-36 shrink-0 rounded-xl" />
      )}
    </div>
  );
}
