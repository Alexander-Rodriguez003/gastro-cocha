"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

function canOptimizeWithNext(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

/** Wrapper sobre next/image con fallback seguro y soporte para URLs externas arbitrarias. */
export function OptimizedImage({
  src,
  fallbackSrc = "/images/placeholder-plate.svg",
  alt,
  ...props
}: OptimizedImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = !src || failedSrc === src ? fallbackSrc : src;
  const isSvg = resolvedSrc.endsWith(".svg");
  const unoptimized = isSvg || !canOptimizeWithNext(resolvedSrc);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) {
          setFailedSrc(resolvedSrc);
        }
      }}
    />
  );
}
