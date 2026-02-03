"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LocationProvider } from "@/contexts/location-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  Building2,
  Loader2,
  CalendarX,
  X,
  MapPin,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface AppointmentData {
  appointment_id: string;
  patient_id: string;
  facility_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  facility_name: string;
  specialties: string | null;
}

function AppointmentsContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchAppointments();
    }
  }, [user, authLoading]);

  const fetchAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments?patient_id=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setAppointments(result.data);
      }
    } catch {
      console.error("Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        toast({
          title: "Appointment cancelled",
          description: "Your appointment has been cancelled successfully.",
        });
        fetchAppointments();
      } else {
        throw new Error();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: AppointmentData["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-success text-success-foreground">Scheduled</Badge>
        );
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="secondary">No Show</Badge>;
    }
  };

  const upcoming = appointments.filter(
    (apt) =>
      new Date(apt.appointment_date) >= new Date() &&
      apt.status !== "cancelled" &&
      apt.status !== "completed"
  );

  const past = appointments.filter(
    (apt) =>
      new Date(apt.appointment_date) < new Date() ||
      apt.status === "cancelled" ||
      apt.status === "completed"
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your doctor appointments
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarX className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No upcoming appointments
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/doctors">Book an Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((apt) => (
                <Card key={apt.appointment_id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {apt.facility_name || "Doctor"}
                        </h3>
                        <p className="text-sm text-primary">
                          {apt.specialties}
                        </p>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {apt.appointment_time} - {apt.appointment_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{apt.facility_name || "Hospital"}</span>
                      </div>
                      {apt.facility_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">
                            {/* Address and city should be fetched from the facility details */}
                          </span>
                        </div>
                      )}
                      {apt.reason && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IndianRupee className="h-4 w-4" />
                          <span>{apt.reason}</span>
                        </div>
                      )}
                    </div>

                    {apt.reason && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Symptoms / Notes
                        </p>
                        <p className="mt-1 text-sm">{apt.reason}</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      {apt.facility_name && (
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${apt.facility_name}`;
                            window.open(url, "_blank");
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Navigate
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 bg-transparent"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel Appointment?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this appointment
                              with {apt.facility_name}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancel(apt.appointment_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {cancellingId === apt.appointment_id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Cancel Appointment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {past.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No past appointments
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((apt) => (
                <Card
                  key={apt.appointment_id}
                  className={`overflow-hidden ${apt.status === "cancelled" ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {apt.facility_name || "Doctor"}
                        </h3>
                        <p className="text-sm text-primary">
                          {apt.specialties}
                        </p>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {apt.appointment_time} - {apt.appointment_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{apt.facility_name || "Hospital"}</span>
                      </div>
                    </div>

                    {apt.status !== "cancelled" && (
                      <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
                        <Link
                          href={`/book/${apt.facility_id}`}
                        >
                          Book Again
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <AppointmentsContent />
        </main>
      </div>
    </LocationProvider>
  );
}
