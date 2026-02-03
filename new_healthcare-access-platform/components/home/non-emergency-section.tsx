"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/location-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Calendar,
  MapPin,
  Star,
  IndianRupee,
  Stethoscope,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Hospital, Patient } from "@/lib/types";
import {
  generateMockHospitals,
  calculateDistance,
} from "@/lib/mock-data";
import { SPECIALIZATIONS, DISEASE_SPECIALIZATION_MAP } from "@/lib/types";
import Link from "next/link";

interface HospitalWithDistance extends Hospital {
  distance: number;
}

export function NonEmergencySection() {
  const { location, isLoading: locationLoading } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalWithDistance[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<
    HospitalWithDistance[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestedSpecializations, setSuggestedSpecializations] = useState<
    string[]
  >([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<
    string | null
  >(null);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    if (location) {
      setIsLoading(true);
      setTimeout(() => {
        const mockHospitals = generateMockHospitals(
          location.latitude,
          location.longitude
        );

        const withDistance = mockHospitals.map((h) => {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            h.location.latitude,
            h.location.longitude
          );
          return {
            ...h,
            distance: Math.round(dist * 10) / 10,
          };
        });

        // Sort by rating for non-emergency
        withDistance.sort((a, b) => b.rating - a.rating);
        setHospitals(withDistance);
        setFilteredHospitals(withDistance);
        setIsLoading(false);
      }, 500);
    }
  }, [location]);

  // Generate suggestions based on patient's diseases
  useEffect(() => {
    if (isAuthenticated && user?.role === "patient") {
      const patient = user as Patient;
      const suggestions = new Set<string>();

      patient.diseases.forEach((disease) => {
        const specs = DISEASE_SPECIALIZATION_MAP[disease];
        if (specs) {
          specs.forEach((s) => suggestions.add(s));
        }
      });

      setSuggestedSpecializations(Array.from(suggestions));
    }
  }, [user, isAuthenticated]);

  // Apply filters
  useEffect(() => {
    let filtered = [...hospitals];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.location.city.toLowerCase().includes(query)
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter((h) =>
        h.departments.some(
          (d) =>
            d.name.toLowerCase().includes(selectedSpecialization.toLowerCase()) ||
            d.doctors.some(
              (doc) =>
                doc.specialization.toLowerCase() ===
                selectedSpecialization.toLowerCase()
            )
        )
      );
    }

    filtered = filtered.filter(
      (h) =>
        h.priceRange.minConsultation >= priceRange[0] &&
        h.priceRange.maxConsultation <= priceRange[1]
    );

    if (minRating > 0) {
      filtered = filtered.filter((h) => h.rating >= minRating);
    }

    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery, selectedSpecialization, priceRange, minRating]);

  // Check for no vacancy and suggest alternatives
  const nearbyHospitalsNoVacancy = hospitals.filter(
    (h) => h.distance < 10 && h.availableNonEmergencyBeds === 0
  );

  const farHospitalsWithVacancy = hospitals.filter(
    (h) => h.distance >= 10 && h.availableNonEmergencyBeds > 0
  );

  if (locationLoading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Non-Emergency / Planned Care
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Non-Emergency / Planned Care
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Book appointments with specialists at your convenience
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Smart Suggestions */}
        {suggestedSpecializations.length > 0 && (
          <div className="mt-4 rounded-lg bg-primary/10 p-3">
            <p className="mb-2 text-sm font-medium">
              Recommended for your health conditions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedSpecializations.map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSelectedSpecialization(spec)}
                >
                  <Stethoscope className="mr-1 h-3 w-3" />
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hospitals by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialization</label>
                <Select
                  value={selectedSpecialization || ""}
                  onValueChange={(v) =>
                    setSelectedSpecialization(v === "all" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specializations</SelectItem>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Price Range: {priceRange[0]} - {priceRange[1]} INR
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={10000}
                  step={100}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select
                  value={minRating.toString()}
                  onValueChange={(v) => setMinRating(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Smart Suggestion for far hospitals */}
        {nearbyHospitalsNoVacancy.length > 0 &&
          farHospitalsWithVacancy.length > 0 && (
            <div className="mb-4 rounded-lg border border-warning bg-warning/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-foreground">
                    Some nearby hospitals have no vacancy
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We found {farHospitalsWithVacancy.length} hospitals slightly
                    farther with availability. Prices may vary.
                  </p>
                </div>
              </div>
            </div>
          )}

        {filteredHospitals.length === 0 ? (
          <div className="py-8 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No hospitals match your filters.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialization(null);
                setPriceRange([0, 5000]);
                setMinRating(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals.slice(0, 6).map((hospital) => (
              <Card
                key={hospital.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  hospital.availableNonEmergencyBeds === 0
                    ? "opacity-60"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">
                      {hospital.name}
                    </h3>
                    <Badge
                      variant={
                        hospital.availableNonEmergencyBeds > 20
                          ? "default"
                          : hospital.availableNonEmergencyBeds > 0
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        hospital.availableNonEmergencyBeds > 20
                          ? "bg-success text-success-foreground"
                          : hospital.availableNonEmergencyBeds === 0
                            ? "text-muted-foreground"
                            : ""
                      }
                    >
                      {hospital.availableNonEmergencyBeds === 0
                        ? "Full"
                        : `${hospital.availableNonEmergencyBeds} beds`}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{hospital.rating}</span>
                    <span className="text-muted-foreground">
                      ({hospital.totalRatings} reviews)
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {hospital.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {hospital.priceRange.minConsultation} -{" "}
                      {hospital.priceRange.maxConsultation}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {hospital.departments.slice(0, 3).map((dept) => (
                      <Badge key={dept.id} variant="outline" className="text-xs">
                        {dept.name}
                      </Badge>
                    ))}
                    {hospital.departments.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hospital.departments.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button
                    className="mt-4 w-full"
                    variant={
                      hospital.availableNonEmergencyBeds === 0
                        ? "outline"
                        : "default"
                    }
                    disabled={hospital.availableNonEmergencyBeds === 0}
                    asChild
                  >
                    <Link href={`/hospitals/${hospital.id}`}>
                      {hospital.availableNonEmergencyBeds === 0
                        ? "No Availability"
                        : "Book Appointment"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/hospitals?type=non-emergency">
              View All Hospitals
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
