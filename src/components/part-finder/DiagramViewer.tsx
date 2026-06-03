"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isRemoteImageSrc } from "@/lib/utils/helpers";
import type { DiagramDetail, DiagramHotspot } from "@/types/partFinder";

interface DiagramViewerProps {
  diagram: DiagramDetail;
  selectedHotspotId?: string | null;
  onHotspotSelect: (hotspot: DiagramHotspot) => void;
}

export function DiagramViewer({
  diagram,
  selectedHotspotId,
  onHotspotSelect,
}: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(3, Math.max(0.5, s - e.deltaY * 0.001)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-hotspot]")) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const sortedHotspots = [...diagram.hotspots].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{diagram.title}</p>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={resetView}
            aria-label="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-card"
        style={{ maxHeight: "70vh", touchAction: "none" }}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="relative w-full origin-center transition-transform duration-75"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            cursor: dragging ? "grabbing" : "grab",
          }}
        >
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={diagram.imageUrl}
              alt={diagram.title}
              fill
              className="object-contain"
              unoptimized={isRemoteImageSrc(diagram.imageUrl)}
              priority
              draggable={false}
            />
            {sortedHotspots.map((hotspot) => {
              const active =
                selectedHotspotId === hotspot.id || hoveredId === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  data-hotspot
                  aria-label={hotspot.label}
                  title={hotspot.label}
                  className={cn(
                    "absolute rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary/25"
                      : "border-primary/50 bg-primary/10 hover:bg-primary/20"
                  )}
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    width: `${hotspot.width}%`,
                    height: `${hotspot.height}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHotspotSelect(hotspot);
                  }}
                  onMouseEnter={() => setHoveredId(hotspot.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
          </div>
        </div>
      </div>
      <p className="text-xs text-secondary">
        Drag to pan · scroll to zoom · tap a highlighted region
      </p>
    </div>
  );
}
