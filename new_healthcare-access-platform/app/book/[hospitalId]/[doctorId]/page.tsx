"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LocationProvider, useLocation } from "@/contexts/location-context";
import { useAuth } from "@/contexts/auth-context";
import { useAppointments } from "@/contexts/appointments-context";
import { AppointmentsProvider } from "@/contexts/appointments-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Star,
  IndianRupee,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  Building2,
  MapPin,
} from "lucide-react";
import type { Hospital, Doctor, TimeSlot } from "@/lib/types";
import { generateMockHospitals, calculateDistance } from "@/lib/mock-data";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface HospitalWithDistance extends Hospital {
  distance: number;
}

function BookingContent({
  hospitalId,
  doctorId,
}: {
  hospitalId: string;
  doctorId: string;
}) {
  const router = useRouter();
  const { location } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { createAppointment } = useAppointments();
  const { toast } = useToast();

  const [hospital, setHospital] = useState<HospitalWithDistance | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [symptoms, setSymptoms] = useState("");

  // Get available dates
  const availableDates = doctor
    ? [...new Set(doctor.availableSlots.filter((s) => !s.isBooked).map((s) => s.date))]
    : [];

  // Get available slots for selected date
  const availableSlots = doctor && selectedDate
    ? doctor.availableSlots.filter(
        (s) => s.date === selectedDate && !s.isBooked
      )
    : [];

  useEffect(() => {
    if (location) {
      setIsLoading(true);
      setTimeout(() => {
        const mockHospitals = generateMockHospitals(
          location.latitude,
          location.longitude
        );

        const found = mockHospitals.find((h) => h.id === hospitalId);
        if (found) {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            found.location.latitude,
            found.location.longitude
          );

          setHospital({
            ...found,
            distance: Math.round(dist * 10) / 10,
          });

          // Find doctor
          for (const dept of found.departments) {
            const doc = dept.doctors.find((d) => d.id === doctorId);
            if (doc) {
              setDoctor(doc);
              break;
            }
          }
        }
        setIsLoading(false);
      }, 500);
    }
  }, [location, hospitalId, doctorId]);

  const handleBookAppointment = async () => {
    if (!user || !selectedSlot || !hospital || !doctor) return;

    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to book an appointment.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setIsBooking(true);
    try {
      await createAppointment({
        patientId: user.id,
        hospitalId: hospital.id,
        doctorId: doctor.id,
        date: selectedSlot.date,
        timeSlot: selectedSlot,
        type: "non-emergency",
        symptoms,
      });

      setBookingComplete(true);
      toast({
        title: "Appointment booked!",
        description: `Your appointment with ${doctor.name} is confirmed.`,
      });
    } catch {
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || !hospital || !doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Booking Confirmed!</h2>
            <p className="mt-2 text-muted-foreground">
              Your appointment with {doctor.name} has been successfully booked.
            </p>

            <div className="mt-6 rounded-lg bg-muted p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {selectedSlot && formatDate(selectedSlot.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {selectedSlot?.startTime} - {selectedSlot?.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital</span>
                  <span className="font-medium">{hospital.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">
                    Rs. {doctor.consultationFee}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild>
                <Link href="/appointments">View My Appointments</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/hospitals/${hospitalId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hospital
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Doctor Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{doctor.name}</h2>
                  <p className="text-primary">{doctor.specialization}</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.qualification}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{doctor.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  {doctor.experience} years exp.
                </span>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{hospital.name}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {hospital.location.address}, {hospital.location.city}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="flex items-center gap-1 text-lg font-bold">
                    <IndianRupee className="h-4 w-4" />
                    {doctor.consultationFee}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label className="mb-3 block">Select Date</Label>
                <div className="flex flex-wrap gap-2">
                  {availableDates.length === 0 ? (
                    <p className="text-muted-foreground">
                      No available dates at the moment.
                    </p>
                  ) : (
                    availableDates.map((date) => (
                      <Button
                        key={date}
                        variant={selectedDate === date ? "default" : "outline"}
                        className="gap-2"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        {formatDate(date)}
                      </Button>
                    ))
                  )}
                </div>
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <Label className="mb-3 block">Select Time Slot</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.length === 0 ? (
                      <p className="text-muted-foreground">
                        No available slots for this date.
                      </p>
                    ) : (
                      availableSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={
                            selectedSlot?.id === slot.id ? "default" : "outline"
                          }
                          className="gap-2"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className="h-4 w-4" />
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Symptoms */}
              {selectedSlot && (
                <div>
                  <Label htmlFor="symptoms" className="mb-3 block">
                    Symptoms / Reason for Visit (Optional)
                  </Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms or reason for the appointment..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {/* Booking Summary */}
              {selectedSlot && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Booking Summary</h4>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Doctor</span>
                        <span>{doctor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span>{formatDate(selectedSlot.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span>
                          {selectedSlot.startTime} - {selectedSlot.endTime}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">
                          Rs. {doctor.consultationFee}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Book Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedSlot || isBooking}
                onClick={handleBookAppointment}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : !isAuthenticated ? (
                  "Login to Book"
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-center text-sm text-muted-foreground">
                  Please{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    login
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:underline"
                  >
                    register
                  </Link>{" "}
                  to book an appointment.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ hospitalId: string; doctorId: string }>;
}) {
  const { hospitalId, doctorId } = use(params);

  return (
    <LocationProvider>
      <AppointmentsProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">
            <BookingContent hospitalId={hospitalId} doctorId={doctorId} />
          </main>
        </div>
      </AppointmentsProvider>
    </LocationProvider>
  );
}
