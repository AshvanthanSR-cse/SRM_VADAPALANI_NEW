"use client";

import React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  Locate,
  MapPin,
  Navigation,
  Phone,
  Bed,
} from "lucide-react";
import type { HealthcareFacility, FacilityWithDetails } from "@/lib/types";

interface HospitalMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  facilities: FacilityWithDetails[];
  selectedFacility?: HealthcareFacility | null;
  onFacilitySelect?: (facility: HealthcareFacility) => void;
  type?: "emergency" | "non-emergency" | "all";
}

interface MapFacility extends FacilityWithDetails {
  x: number;
  y: number;
}

export function HospitalMap({
  userLocation,
  facilities,
  selectedFacility,
  onFacilitySelect,
  type = "all",
}: HospitalMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapFacilities, setMapFacilities] = useState<MapFacility[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredFacility, setHoveredFacility] = useState<MapFacility | null>(
    null
  );
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = useCallback(
    (lat: number, lng: number, centerLat: number, centerLng: number) => {
      const scale = 5000 * zoom;
      const x = dimensions.width / 2 + (lng - centerLng) * scale + pan.x;
      const y = dimensions.height / 2 - (lat - centerLat) * scale + pan.y;
      return { x, y };
    },
    [zoom, pan, dimensions]
  );

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.max(400, rect.height),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate facility positions
  useEffect(() => {
    if (!userLocation) return;

    const mapped = facilities.map((facility) => {
      const { x, y } = latLngToCanvas(
        facility.lat,
        facility.lon,
        userLocation.latitude,
        userLocation.longitude
      );
      return { ...facility, x, y };
    });

    setMapFacilities(mapped);
  }, [facilities, userLocation, latLngToCanvas]);

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !userLocation) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(128, 128, 128, 0.1)";
    ctx.lineWidth = 1;
    const gridSize = 50 * zoom;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw range circles
    const userPos = latLngToCanvas(
      userLocation.latitude,
      userLocation.longitude,
      userLocation.latitude,
      userLocation.longitude
    );

    // 5km radius
    ctx.beginPath();
    ctx.arc(userPos.x, userPos.y, 50 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
    ctx.fill();

    // 10km radius
    ctx.beginPath();
    ctx.arc(userPos.x, userPos.y, 100 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(234, 179, 8, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw facilities
    mapFacilities.forEach((facility) => {
      const isSelected = selectedFacility?.facility_id === facility.facility_id;
      const isHovered = hoveredFacility?.facility_id === facility.facility_id;
      const isEmergency = facility.emergency_available;
      const hasAvailability = facility.total_beds > 0;

      let color: string;
      if (!hasAvailability) {
        color = "#9ca3af";
      } else if (isEmergency) {
        color = "#ef4444";
      } else {
        color = "#3b82f6";
      }

      if (hasAvailability) {
        color = "#22c55e";
      }

      const radius = isSelected || isHovered ? 14 : 10;

      ctx.beginPath();
      ctx.arc(facility.x, facility.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#fff" : "rgba(255,255,255,0.5)";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Draw plus sign
      ctx.fillStyle = "#fff";
      ctx.fillRect(facility.x - 4, facility.y - 1, 8, 2);
      ctx.fillRect(facility.x - 1, facility.y - 4, 2, 8);

      // Draw label if hovered or selected
      if (isHovered || isSelected) {
        ctx.font = "12px sans-serif";
        const label = `${facility.name} (${facility.distance?.toFixed(1) || "N/A"}km)`;
        const metrics = ctx.measureText(label);
        const padding = 8;

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.beginPath();
        ctx.roundRect(
          facility.x - metrics.width / 2 - padding,
          facility.y - 35,
          metrics.width + padding * 2,
          24,
          4
        );
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(label, facility.x, facility.y - 19);
      }
    });

    // Draw user location
    ctx.beginPath();
    ctx.arc(userPos.x, userPos.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#4f46e5";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // User pulse
    ctx.beginPath();
    ctx.arc(userPos.x, userPos.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(79, 70, 229, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [
    mapFacilities,
    userLocation,
    selectedFacility,
    hoveredFacility,
    zoom,
    pan,
    dimensions,
    latLngToCanvas,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: pan.x + (e.clientX - dragStart.x),
        y: pan.y + (e.clientY - dragStart.y),
      });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const hovered = mapFacilities.find((f) => {
      const dx = f.x - x;
      const dy = f.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });
    setHoveredFacility(hovered || null);
    canvas.style.cursor = hovered ? "pointer" : isDragging ? "grabbing" : "grab";
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredFacility) {
      onFacilitySelect?.(hoveredFacility);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.5, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.5, 0.5));
  const handleRecenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!userLocation) {
    return (
      <Card className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="h-[400px] w-full rounded-lg border border-border md:h-[500px]"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleRecenter}>
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 p-3 backdrop-blur">
        <p className="mb-2 text-xs font-medium">Legend</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Non-Emergency</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span>Full</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-indigo-600" />
            <span>You</span>
          </div>
        </div>
      </div>

      {/* Selected Facility Info */}
      {selectedFacility && (
        <Card className="absolute bottom-4 right-4 w-72 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{selectedFacility.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedFacility.specialties || "General Healthcare"}
              </p>
            </div>
            <Badge
              variant={
                selectedFacility.emergency_available ? "default" : "secondary"
              }
              className={
                selectedFacility.emergency_available
                  ? "bg-emergency text-emergency-foreground"
                  : ""
              }
            >
              {selectedFacility.emergency_available ? "Emergency" : "Regular"}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {mapFacilities
                .find((f) => f.facility_id === selectedFacility.facility_id)
                ?.distance?.toFixed(1) || "N/A"}{" "}
              km
            </span>
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {selectedFacility.total_beds} beds
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lon}`;
                window.open(url, "_blank");
              }}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Navigate
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="tel:108">
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
