"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80",
    alt: "Car engine components",
  },
  {
    src: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Performance vehicle on the road",
  },
  {
    src: "https://images.unsplash.com/photo-1769218401073-71a5b1020c9b?q=80&w=2298&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Mechanic working on a vehicle",
  },
] as const;

interface HeroCarouselProps {
  title: string;
  subtitle: string;
  className?: string;
  intervalMs?: number;
}

export function HeroCarousel({
  title,
  subtitle,
  className,
  intervalMs = 6000,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = HERO_SLIDES.length;

  const goTo = useCallback(
    (nextIndex: number) => {
      setIndex(((nextIndex % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, paused]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-3xl", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative aspect-[5/3] min-h-[220px] sm:aspect-[21/9] sm:min-h-[280px] md:min-h-[340px]"
        aria-roledescription="carousel"
        aria-label="Featured auto parts imagery"
      >
        {HERO_SLIDES.map((slide, slideIndex) => (
          <div
            key={slide.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              slideIndex === index ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={slideIndex === 0}
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14">
          <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:left-4"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:right-4"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(slideIndex)}
              className={cn(
                "h-2 rounded-full transition-all",
                slideIndex === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={slideIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
