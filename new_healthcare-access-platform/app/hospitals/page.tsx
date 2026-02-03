"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { HospitalMap } from "@/components/map/hospital-map";
import { LocationProvider, useLocation } from "@/contexts/location-context";
import { LocationPermissionModal } from "@/components/location-permission-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Bed,
  IndianRupee,
  Search,
  Loader2,
  Navigation,
  Phone,
  Clock,
  Filter,
  List,
  Map,
} from "lucide-react";
import type { FacilityWithDetails, HealthcareFacility } from "@/lib/types";
import Link from "next/link";

interface FacilityWithDistance extends FacilityWithDetails {
  distance: number;
  responseTime: string;
}

function estimateResponseTime(distance: number): string {
  const avgSpeed = 40; // km/h in city
  const minutes = Math.round((distance / avgSpeed) * 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

function HospitalsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const { location, isLoading: locationLoading } = useLocation();

  const [facilities, setFacilities] = useState<FacilityWithDistance[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<
    FacilityWithDistance[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] =
    useState<HealthcareFacility | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeTab, setActiveTab] = useState<
    "all" | "emergency" | "non-emergency"
  >(initialType as "all" | "emergency" | "non-emergency");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true);
      try {
        let url = "/api/facilities";
        const params = new URLSearchParams();

        if (location) {
          params.set("lat", location.latitude.toString());
          params.set("lon", location.longitude.toString());
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          const withResponseTime = result.data.map(
            (f: FacilityWithDetails) => ({
              ...f,
              distance: f.distance || 0,
              responseTime: estimateResponseTime(f.distance || 0),
            })
          );
          setFacilities(withResponseTime);
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, [location]);

  // Apply filters
  useEffect(() => {
    let filtered = [...facilities];

    // Filter by type
    if (activeTab === "emergency") {
      filtered = filtered.filter((f) => f.emergency_available);
    } else if (activeTab === "non-emergency") {
      filtered = filtered.filter((f) => !f.emergency_available);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          (f.specialties && f.specialties.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "distance":
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case "beds":
        filtered.sort((a, b) => b.total_beds - a.total_beds);
        break;
      case "price-low":
        filtered.sort(
          (a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) => (b.consultation_fee || 0) - (a.consultation_fee || 0)
        );
        break;
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchQuery, sortBy, activeTab]);

  const handleNavigate = (facility: FacilityWithDistance) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (locationLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Hospitals</h1>
        <p className="mt-2 text-muted-foreground">
          Discover hospitals near you based on your healthcare needs
        </p>
      </div>

      {/* Tabs and Controls */}
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "all" | "emergency" | "non-emergency")
        }
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">All Hospitals</TabsTrigger>
            <TabsTrigger value="emergency" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="non-emergency" className="gap-2">
              <Calendar className="h-4 w-4" />
              Non-Emergency
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
            >
              <Map className="mr-2 h-4 w-4" />
              Map
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="beds">Most Beds</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {filteredFacilities.length} hospitals
        </p>

        <TabsContent value="all" className="mt-0">
          {viewMode === "map" ? (
            <HospitalMap
              userLocation={location}
              facilities={filteredFacilities}
              selectedFacility={selectedFacility}
              onFacilitySelect={setSelectedFacility}
              type="all"
            />
          ) : (
            <FacilityList
              facilities={filteredFacilities}
              onNavigate={handleNavigate}
              type="all"
            />
          )}
        </TabsContent>

        <TabsContent value="emergency" className="mt-0">
          {viewMode === "map" ? (
            <HospitalMap
              userLocation={location}
              facilities={filteredFacilities}
              selectedFacility={selectedFacility}
              onFacilitySelect={setSelectedFacility}
              type="emergency"
            />
          ) : (
            <FacilityList
              facilities={filteredFacilities}
              onNavigate={handleNavigate}
              type="emergency"
            />
          )}
        </TabsContent>

        <TabsContent value="non-emergency" className="mt-0">
          {viewMode === "map" ? (
            <HospitalMap
              userLocation={location}
              facilities={filteredFacilities}
              selectedFacility={selectedFacility}
              onFacilitySelect={setSelectedFacility}
              type="non-emergency"
            />
          ) : (
            <FacilityList
              facilities={filteredFacilities}
              onNavigate={handleNavigate}
              type="non-emergency"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FacilityList({
  facilities,
  onNavigate,
  type,
}: {
  facilities: FacilityWithDistance[];
  onNavigate: (facility: FacilityWithDistance) => void;
  type: "all" | "emergency" | "non-emergency";
}) {
  if (facilities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No hospitals found matching your criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility) => (
        <Card
          key={facility.facility_id}
          className={`overflow-hidden transition-shadow hover:shadow-lg ${
            type === "emergency" ? "border-emergency/30" : ""
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="line-clamp-1 font-semibold text-foreground">
                  {facility.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {facility.specialties || "General Healthcare"}
                </p>
              </div>
              <Badge
                variant={facility.emergency_available ? "default" : "secondary"}
                className={
                  facility.emergency_available
                    ? "bg-emergency text-emergency-foreground"
                    : ""
                }
              >
                {facility.emergency_available ? "Emergency" : "Regular"}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {facility.distance?.toFixed(1) || "N/A"} km
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {facility.responseTime}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {facility.total_beds} beds
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {facility.consultation_fee
                  ? `Rs. ${facility.consultation_fee}`
                  : "Contact for pricing"}
              </span>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              <Clock className="mr-1 inline h-3 w-3" />
              {facility.operating_hours || "Contact for hours"}
            </div>

            <div className="mt-4 flex gap-2">
              {type === "emergency" ? (
                <>
                  <Button
                    className="flex-1 bg-emergency text-emergency-foreground hover:bg-emergency/90"
                    onClick={() => onNavigate(facility)}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Navigate
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="tel:108">
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button className="flex-1" asChild>
                    <Link href={`/hospitals/${facility.facility_id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate(facility)}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HospitalsPage() {
  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <LocationPermissionModal />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <HospitalsContent />
          </Suspense>
        </main>
      </div>
    </LocationProvider>
  );
}
