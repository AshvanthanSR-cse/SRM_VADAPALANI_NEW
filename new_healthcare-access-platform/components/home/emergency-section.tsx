"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/location-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Bed,
  Phone,
  Navigation,
  Loader2,
  ChevronRight,
} from "lucide-react";
import type { Hospital } from "@/lib/types";
import {
  generateMockHospitals,
  calculateDistance,
  estimateResponseTime,
} from "@/lib/mock-data";
import Link from "next/link";

interface HospitalWithDistance extends Hospital {
  distance: number;
  responseTime: string;
}

export function EmergencySection() {
  const { location, isLoading: locationLoading } = useLocation();
  const [hospitals, setHospitals] = useState<HospitalWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockHospitals = generateMockHospitals(
          location.latitude,
          location.longitude
        );

        // Filter and sort by distance, only include hospitals with emergency beds
        const withDistance = mockHospitals
          .filter((h) => h.availableEmergencyBeds > 0)
          .map((h) => {
            const dist = calculateDistance(
              location.latitude,
              location.longitude,
              h.location.latitude,
              h.location.longitude
            );
            return {
              ...h,
              distance: Math.round(dist * 10) / 10,
              responseTime: estimateResponseTime(dist),
            };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 4); // Top 4 nearest

        setHospitals(withDistance);
        setIsLoading(false);
      }, 500);
    }
  }, [location]);

  const handleEmergencyNavigate = (hospital: HospitalWithDistance) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.location.latitude},${hospital.location.longitude}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (locationLoading || isLoading) {
    return (
      <Card className="border-emergency/30 bg-emergency/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emergency">
            <AlertTriangle className="h-5 w-5" />
            Emergency Services
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emergency" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emergency/30 bg-emergency/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-emergency">
            <AlertTriangle className="h-5 w-5" />
            Emergency Services
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse">
            24/7 Available
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Nearest hospitals with available emergency beds, sorted by distance
        </p>
      </CardHeader>
      <CardContent>
        {hospitals.length === 0 ? (
          <div className="py-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No hospitals with available emergency beds nearby.
            </p>
            <p className="text-sm text-muted-foreground">
              Please call emergency services: 108
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {hospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {hospital.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {hospital.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {hospital.responseTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {hospital.availableEmergencyBeds} beds
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        hospital.availableEmergencyBeds > 10
                          ? "default"
                          : "secondary"
                      }
                      className={
                        hospital.availableEmergencyBeds > 10
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {hospital.availableEmergencyBeds > 10
                        ? "Available"
                        : "Limited"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emergency text-emergency-foreground hover:bg-emergency/90"
                      onClick={() => handleEmergencyNavigate(hospital)}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${hospital.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/hospitals?type=emergency">
              View All Emergency Services
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
