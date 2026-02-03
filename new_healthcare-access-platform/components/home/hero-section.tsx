"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Clock, Users } from "lucide-react";
import Link from "next/link";
import { useLocation } from "@/contexts/location-context";

export function HeroSection() {
  const { location, permissionDenied, requestLocation } = useLocation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Smart Healthcare Platform
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Find Healthcare When You Need It Most
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Connect with hospitals and doctors based on emergency or non-emergency needs. 
            Real-time availability, transparent pricing, and instant navigation to care.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="#services">
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
              <Link href="/hospitals">
                Browse Hospitals
              </Link>
            </Button>
          </div>

          {/* Location Status */}
          <div className="mt-8">
            {permissionDenied ? (
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={requestLocation}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Enable location for better results
              </Button>
            ) : location ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-success" />
                <span>Location detected - Showing nearby hospitals</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">500+</p>
            <p className="text-sm text-muted-foreground">Verified Hospitals</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">2,000+</p>
            <p className="text-sm text-muted-foreground">Expert Doctors</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">24/7</p>
            <p className="text-sm text-muted-foreground">Emergency Support</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">50+</p>
            <p className="text-sm text-muted-foreground">Cities Covered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
