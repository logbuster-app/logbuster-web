"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Altura mínima do espaço do fallback (a moldura pai define a proporção). */
  fallbackClassName?: string;
};

/** Pôster da OMDb; se não há URL ou a imagem falha ao carregar, mostra "Sem poster". */
export function PosterImage({ src, alt, sizes, priority, fallbackClassName = "" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={`flex h-full items-center justify-center p-3 text-center text-sm text-subtle ${fallbackClassName}`}
      >
        Sem poster
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      onError={() => setFailedSrc(src)}
    />
  );
}
