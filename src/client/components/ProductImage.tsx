"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  fallbackLabel?: string;
};

export default function ProductImage({
  src,
  alt,
  sizes,
  className = "object-contain p-3",
  fallbackLabel = "Gorsel yok",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = src?.trim();

  if (!normalizedSrc || hasError) {
    return (
      <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
        {fallbackLabel}
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
