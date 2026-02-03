"use client";

import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/home/hero-section";
import { EmergencySection } from "@/components/home/emergency-section";
import { NonEmergencySection } from "@/components/home/non-emergency-section";
import { LocationProvider } from "@/contexts/location-context";
import { LocationPermissionModal } from "@/components/location-permission-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeartPulse,
  Ambulance,
  CalendarCheck,
  MapPinned,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <LocationPermissionModal />

        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection />

          {/* Services Section */}
          <section id="services" className="py-16">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  Our Services
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                  Whether you need immediate emergency care or planned medical consultations, 
                  we connect you with the right healthcare providers.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Emergency Section */}
                <EmergencySection />

                {/* Non-Emergency Section */}
                <div className="lg:col-span-2">
                  <NonEmergencySection />
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  How It Works
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                  Simple steps to access healthcare quickly and efficiently
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      1
                    </div>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MapPinned className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">Enable Location</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Allow location access to find hospitals and doctors near you
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      2
                    </div>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Ambulance className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">Choose Service Type</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Select emergency for urgent care or non-emergency for planned visits
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      3
                    </div>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <HeartPulse className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">Select Hospital</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Compare hospitals by distance, availability, rating, and price
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      4
                    </div>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <CalendarCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">Book or Navigate</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Book an appointment or get instant navigation to emergency care
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden bg-primary">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
                  <HeartPulse className="h-16 w-16 text-primary-foreground" />
                  <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                    Ready to Get Started?
                  </h2>
                  <p className="max-w-xl text-primary-foreground/80">
                    Register now to access personalized healthcare recommendations, 
                    manage your appointments, and get disease-based doctor suggestions.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Button
                      size="lg"
                      variant="secondary"
                      asChild
                    >
                      <Link href="/register">
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                      asChild
                    >
                      <Link href="/hospitals">
                        Browse as Guest
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <HeartPulse className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">MediCare Connect</span>
                </Link>
                <p className="mt-4 text-sm text-muted-foreground">
                  Smart healthcare platform connecting patients with hospitals and doctors 
                  for emergency and non-emergency care.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Quick Links</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/hospitals"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Find Hospitals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/doctors"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Find Doctors
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Login
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">For Hospitals</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/register"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Register Hospital
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hospital/dashboard"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Hospital Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Contact</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Emergency: 108
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Support: +91 1800 123 4567
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    support@medicareconnect.in
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>2026 MediCare Connect. All rights reserved.</p>
              <p className="mt-1">
                Built for Healthcare Access Equality in Rural and Semi-Urban Areas
              </p>
            </div>
          </div>
        </footer>
      </div>
    </LocationProvider>
  );
}
