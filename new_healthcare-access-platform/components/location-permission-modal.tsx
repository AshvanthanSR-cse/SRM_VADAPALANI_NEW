"use client";

import { useLocation } from "@/contexts/location-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle } from "lucide-react";

export function LocationPermissionModal() {
  const { permissionDenied, requestLocation, location } = useLocation();

  // Don't show if we have location or permission isn't denied
  if (!permissionDenied || location) return null;

  return (
    <Dialog open={permissionDenied}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/20">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <DialogTitle className="text-center text-xl">
            Location Access Required
          </DialogTitle>
          <DialogDescription className="text-center">
            To find nearby hospitals and provide emergency services, we need
            access to your location. Please enable location access in your
            browser settings.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Button onClick={requestLocation} className="w-full">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location Access
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your location data is only used to find nearby hospitals and is
            never stored or shared.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
