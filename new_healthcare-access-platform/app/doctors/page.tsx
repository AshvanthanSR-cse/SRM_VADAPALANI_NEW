"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { LocationProvider, useLocation } from "@/contexts/location-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Star,
  IndianRupee,
  Search,
  Loader2,
  Calendar,
  Stethoscope,
  Filter,
  Building2,
} from "lucide-react";
import type { Doctor, Hospital, Patient } from "@/lib/types";
import { SPECIALIZATIONS, DISEASE_SPECIALIZATION_MAP } from "@/lib/types";
import { generateMockHospitals, calculateDistance } from "@/lib/mock-data";
import Link from "next/link";

interface DoctorWithHospital extends Doctor {
  hospital: Hospital;
  hospitalDistance: number;
}

function DoctorsContent() {
  const { location, isLoading: locationLoading } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState<DoctorWithHospital[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithHospital[]>(
    []
  );
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
  const [maxFee, setMaxFee] = useState<string>("all");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    if (location) {
      setIsLoading(true);
      setTimeout(() => {
        const mockHospitals = generateMockHospitals(
          location.latitude,
          location.longitude
        );

        // Extract all doctors with hospital info
        const allDoctors: DoctorWithHospital[] = [];
        mockHospitals.forEach((hospital) => {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            hospital.location.latitude,
            hospital.location.longitude
          );
          hospital.departments.forEach((dept) => {
            dept.doctors.forEach((doctor) => {
              allDoctors.push({
                ...doctor,
                hospital,
                hospitalDistance: Math.round(dist * 10) / 10,
              });
            });
          });
        });

        setDoctors(allDoctors);
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
    let filtered = [...doctors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.specialization.toLowerCase().includes(query) ||
          d.hospital.name.toLowerCase().includes(query)
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(
        (d) =>
          d.specialization.toLowerCase() === selectedSpecialization.toLowerCase()
      );
    }

    if (maxFee !== "all") {
      const fee = parseInt(maxFee);
      filtered = filtered.filter((d) => d.consultationFee <= fee);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        filtered.sort((a, b) => b.experience - a.experience);
        break;
      case "fee-low":
        filtered.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case "fee-high":
        filtered.sort((a, b) => b.consultationFee - a.consultationFee);
        break;
      case "distance":
        filtered.sort((a, b) => a.hospitalDistance - b.hospitalDistance);
        break;
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, selectedSpecialization, maxFee, sortBy]);

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
        <h1 className="text-3xl font-bold">Find Doctors</h1>
        <p className="mt-2 text-muted-foreground">
          Book appointments with qualified doctors near you
        </p>
      </div>

      {/* Smart Suggestions */}
      {suggestedSpecializations.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">
              Based on your health profile, we recommend:
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
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialization, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedSpecialization || "all"}
            onValueChange={(v) =>
              setSelectedSpecialization(v === "all" ? null : v)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
              <SelectItem value="fee-low">Fee: Low to High</SelectItem>
              <SelectItem value="fee-high">Fee: High to Low</SelectItem>
              <SelectItem value="distance">Nearest First</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            More
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Fee</label>
                <Select value={maxFee} onValueChange={setMaxFee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any fee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any fee</SelectItem>
                    <SelectItem value="500">Up to Rs. 500</SelectItem>
                    <SelectItem value="1000">Up to Rs. 1000</SelectItem>
                    <SelectItem value="1500">Up to Rs. 1500</SelectItem>
                    <SelectItem value="2000">Up to Rs. 2000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filteredDoctors.length} doctors
      </p>

      {/* Doctor List */}
      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No doctors found matching your criteria.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialization(null);
                setMaxFee("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card
              key={`${doctor.id}-${doctor.hospitalId}`}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-primary">
                      {doctor.specialization}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.qualification} - {doctor.experience} years
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{doctor.rating}</span>
                    <span className="text-muted-foreground">
                      ({doctor.totalRatings})
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    {doctor.consultationFee}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="line-clamp-1">{doctor.hospital.name}</span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {doctor.hospitalDistance} km - {doctor.hospital.location.city}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge
                    variant={
                      doctor.availableSlots.filter((s) => !s.isBooked).length > 5
                        ? "default"
                        : "secondary"
                    }
                    className={
                      doctor.availableSlots.filter((s) => !s.isBooked).length > 5
                        ? "bg-success text-success-foreground"
                        : ""
                    }
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {doctor.availableSlots.filter((s) => !s.isBooked).length}{" "}
                    slots available
                  </Badge>
                  <Button size="sm" asChild>
                    <Link
                      href={`/book/${doctor.hospital.id}/${doctor.id}`}
                    >
                      Book Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <DoctorsContent />
        </main>
      </div>
    </LocationProvider>
  );
}
