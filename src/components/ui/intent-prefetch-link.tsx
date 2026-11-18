"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type IntentPrefetchLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

export function IntentPrefetchLink({
  children,
  onFocus,
  onMouseEnter,
  onTouchStart,
  ...props
}: IntentPrefetchLinkProps) {
  const [hasIntent, setHasIntent] = useState(false);
  const enablePrefetch = () => setHasIntent(true);

  return (
    <Link
      {...props}
      prefetch={hasIntent}
      onFocus={(event) => {
        enablePrefetch();
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        enablePrefetch();
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        enablePrefetch();
        onTouchStart?.(event);
      }}
    >
      {children}
    </Link>
  );
}
