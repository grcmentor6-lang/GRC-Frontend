/**
 * Skeleton loading primitives. Prefer these over a circular spinner so the loading state
 * previews the shape of the content that's about to arrive (less layout jump, calmer feel).
 * The parent wrapper carries `animate-pulse`; individual blocks are just tinted rectangles.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-md ${className}`} />;
}

/** A single card-shaped placeholder (icon + two text lines + a bar). */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl ring-1 ring-slate-200 bg-white p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2.5 w-1/2 opacity-70" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full opacity-70" />
      <Skeleton className="h-2.5 w-4/5 opacity-70" />
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

/** A grid of card placeholders (no heading) — drop in where a page header is already shown. */
export function SkeletonCardGrid({
  cards = 6,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** A form-card placeholder (title + labelled inputs + button) — for auth / checkout screens. */
export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="animate-pulse bg-white rounded-2xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7 space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-3/4 opacity-70" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-24 opacity-70" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/** Generic content-page skeleton: heading + a responsive grid of card placeholders. */
export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="page-shell animate-pulse">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-3.5 w-80 max-w-full mb-6 opacity-70" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
