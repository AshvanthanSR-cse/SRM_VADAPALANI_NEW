"use client";

import { useState, useEffect, use } from "react";
import { Header } from "@/components/layout/header";
import { LocationProvider } from "@/contexts/location-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  IndianRupee,
  Phone,
  Clock,
  Navigation,
  Calendar,
  Loader2,
  ArrowLeft,
  Building2,
  AlertTriangle,
} from "lucide-react";
import type { FacilityWithDetails } from "@/lib/types";
import Link from "next/link";

function HospitalDetailContent({ id }: { id: string }) {
  const [facility, setFacility] = useState<FacilityWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacility = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/facilities/${id}`);
        const result = await response.json();

        if (result.success) {
          setFacility(result.data);
        } else {
          setError(result.error || "Failed to load facility");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error || "Facility not found"}</p>
        <Button asChild>
          <Link href="/hospitals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hospitals
          </Link>
        </Button>
      </div>
    );
  }

  const specialtiesArray = facility.specialties
    ? facility.specialties.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/hospitals">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hospitals
        </Link>
      </Button>

      {/* Hospital Header */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{facility.name}</h1>
                  <p className="mt-1 text-muted-foreground">
                    {facility.specialties || "General Healthcare"}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <Badge
                      variant={
                        facility.emergency_available ? "default" : "secondary"
                      }
                      className={
                        facility.emergency_available
                          ? "bg-emergency text-emergency-foreground"
                          : ""
                      }
                    >
                      {facility.emergency_available
                        ? "Emergency Available"
                        : "Regular Services"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`;
                    window.open(url, "_blank");
                  }}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Navigate
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:108">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <MapPin className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold">
                  {facility.lat.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Latitude</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <Bed className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold">{facility.total_beds}</p>
                <p className="text-sm text-muted-foreground">total beds</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <Clock className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-lg font-bold">
                  {facility.operating_hours || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">hours</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <IndianRupee className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold">
                  {facility.consultation_fee || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">consultation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Book Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Book an appointment at this hospital for consultations.
            </p>
            <Button className="w-full" asChild>
              <Link href={`/book/${facility.facility_id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Book Now
              </Link>
            </Button>

            {facility.emergency_available && (
              <div className="rounded-lg border border-emergency/30 bg-emergency/5 p-4">
                <div className="flex items-center gap-2 text-emergency">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Emergency Services</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  24/7 emergency care available
                </p>
                <Button
                  className="mt-3 w-full bg-emergency text-emergency-foreground hover:bg-emergency/90"
                  asChild
                >
                  <a href="tel:108">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Emergency (108)
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Specialties */}
      {specialtiesArray.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {specialtiesArray.map((specialty) => (
                <Badge key={specialty} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <HospitalDetailContent id={id} />
        </main>
      </div>
    </LocationProvider>
  );
}
