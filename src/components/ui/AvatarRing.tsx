import React from 'react';
import Image from 'next/image';
type Tier = 'standard' | 'verified' | 'signature';
export default function AvatarRing(
  { tier = 'standard', src, alt = '', ...props }:
  { tier?: Tier; src: string; alt?: string } & React.ImgHTMLAttributes<HTMLImageElement>
) {
  const ring = {
    standard: 'ring-2 ring-neutral-700',
    verified: 'ring-2 ring-brand',
    signature:'ring-2 ring-brand animate-pulse',
  }[tier];
  return <Image {...props} src={src} alt={alt} width={48} height={48} className={`h-12 w-12 rounded-full ${ring}`} />;
}
