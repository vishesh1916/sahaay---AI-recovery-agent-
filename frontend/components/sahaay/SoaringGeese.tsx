'use client';

import React from 'react';
import Image from 'next/image';

interface GooseProps {
  className?: string;
  size?: number;
  rotation?: number;
  opacity?: number;
  variant?: 1 | 2;
  flapping?: boolean;
}

export function SoaringGooseSolo({
  className = '',
  size = 72,
  rotation = 0,
  opacity = 0.95,
  variant = 1,
  flapping = true,
}: GooseProps) {
  const imgSrc = variant === 2 ? '/images/goose_flying_2.png' : '/images/goose_flying_1.png';
  const width = size;
  const height = Math.round(size * 0.78);

  return (
    <div
      className={`pointer-events-none select-none inline-block drop-shadow-md transition-transform duration-500 hover:scale-105 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity,
      }}
      aria-hidden="true"
    >
      <div
        className={`relative ${flapping ? (variant === 2 ? 'animate-avian-wing-fast' : 'animate-avian-wing') : ''}`}
        style={{ width, height }}
      >
        <Image
          src={imgSrc}
          alt="Canada goose soaring across the sky"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function SingleGoose(props: GooseProps) {
  return <SoaringGooseSolo {...props} />;
}

/**
 * LivingGeeseFlock:
 * Continuous aerodynamic V-formation that glides across the horizon
 * with organic wing-beat physics and sinusoidal altitude shifts.
 */
export function LivingGeeseFlock({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden absolute inset-0 z-10 ${className}`}>
      {/* Primary formation: glides across horizontally */}
      <div className="absolute top-[18%] left-0 w-full animate-flock-glide">
        <div className="relative flex items-center gap-3">
          {/* Lead Goose */}
          <div className="relative -top-2">
            <SoaringGooseSolo size={68} rotation={-4} opacity={0.94} variant={1} />
          </div>
          {/* Wing Goose Right 1 */}
          <div className="relative top-4 -left-1">
            <SoaringGooseSolo size={56} rotation={-3} opacity={0.88} variant={2} />
          </div>
          {/* Wing Goose Left 1 */}
          <div className="relative -top-7 -left-3">
            <SoaringGooseSolo size={54} rotation={-5} opacity={0.85} variant={1} />
          </div>
          {/* Wing Goose Right 2 */}
          <div className="relative top-9 -left-4">
            <SoaringGooseSolo size={44} rotation={-2} opacity={0.78} variant={2} />
          </div>
          {/* Wing Goose Left 2 */}
          <div className="relative -top-12 -left-6">
            <SoaringGooseSolo size={42} rotation={-6} opacity={0.72} variant={1} />
          </div>
        </div>
      </div>

      {/* Distant background pair soaring in opposite atmospheric stream */}
      <div className="absolute top-[34%] right-0 w-full animate-flock-glide-alt hidden lg:block opacity-60">
        <div className="relative flex items-center gap-4">
          <SoaringGooseSolo size={36} rotation={4} opacity={0.65} variant={1} />
          <div className="relative -top-3">
            <SoaringGooseSolo size={28} rotation={5} opacity={0.55} variant={2} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SoaringGeeseHeroCluster({ className = '' }: { className?: string }) {
  return <LivingGeeseFlock className={className} />;
}

