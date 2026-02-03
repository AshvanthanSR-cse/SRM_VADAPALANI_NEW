"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type {
  PatientRegistrationData,
  HospitalRegistrationData,
} from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Loader2, User, Building2, X, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { COMMON_DISEASES } from "@/lib/types";

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<"patient" | "hospital">("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    gender: "" as "male" | "female" | "other" | "",
    phone: "",
    diseases: [] as string[],
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
  });

  // Hospital form state
  const [hospitalForm, setHospitalForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
    serviceRadius: "15",
    emergencyCapacity: "20",
    nonEmergencyCapacity: "50",
    minConsultation: "300",
    maxConsultation: "1500",
    emergencyCharges: "5000",
  });

  const [diseaseInput, setDiseaseInput] = useState("");

  const detectLocation = async (type: "patient" | "hospital") => {
    setIsDetectingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (type === "patient") {
              setPatientForm((prev) => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }));
            } else {
              setHospitalForm((prev) => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }));
            }
            toast({
              title: "Location detected",
              description: "Your location has been automatically detected.",
            });
          },
          () => {
            toast({
              title: "Location access denied",
              description: "Please enter your address manually.",
              variant: "destructive",
            });
          }
        );
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const addDisease = (disease: string) => {
    if (disease && !patientForm.diseases.includes(disease)) {
      setPatientForm((prev) => ({
        ...prev,
        diseases: [...prev.diseases, disease],
      }));
    }
    setDiseaseInput("");
  };

  const removeDisease = (disease: string) => {
    setPatientForm((prev) => ({
      ...prev,
      diseases: prev.diseases.filter((d) => d !== disease),
    }));
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (patientForm.password !== patientForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data: PatientRegistrationData = {
        role: "patient",
        email: patientForm.email,
        password: patientForm.password,
        name: patientForm.name,
        age: parseInt(patientForm.age),
        gender: patientForm.gender as "male" | "female" | "other",
        phone: patientForm.phone,
        diseases: patientForm.diseases,
        location: {
          latitude: patientForm.latitude || 19.076,
          longitude: patientForm.longitude || 72.8777,
          address: patientForm.address,
          city: patientForm.city,
          state: patientForm.state,
          pincode: patientForm.pincode,
        },
      };

      const success = await register(data);
      if (success) {
        toast({
          title: "Registration successful!",
          description: "Welcome to MediCare Connect.",
        });
        router.push("/");
      }
    } catch {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hospitalForm.password !== hospitalForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data: HospitalRegistrationData = {
        role: "hospital",
        email: hospitalForm.email,
        password: hospitalForm.password,
        name: hospitalForm.name,
        phone: hospitalForm.phone,
        location: {
          latitude: hospitalForm.latitude || 19.076,
          longitude: hospitalForm.longitude || 72.8777,
          address: hospitalForm.address,
          city: hospitalForm.city,
          state: hospitalForm.state,
          pincode: hospitalForm.pincode,
        },
        serviceRadius: parseInt(hospitalForm.serviceRadius),
        emergencyCapacity: parseInt(hospitalForm.emergencyCapacity),
        nonEmergencyCapacity: parseInt(hospitalForm.nonEmergencyCapacity),
        priceRange: {
          minConsultation: parseInt(hospitalForm.minConsultation),
          maxConsultation: parseInt(hospitalForm.maxConsultation),
          emergencyCharges: parseInt(hospitalForm.emergencyCharges),
        },
      };

      const success = await register(data);
      if (success) {
        toast({
          title: "Registration successful!",
          description: "Welcome to MediCare Connect.",
        });
        router.push("/hospital/dashboard");
      }
    } catch {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MediCare Connect</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4 py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Create an Account
            </CardTitle>
            <CardDescription>
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "patient" | "hospital")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="gap-2">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="hospital" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Hospital
                </TabsTrigger>
              </TabsList>

              {/* Patient Registration Form */}
              <TabsContent value="patient">
                <form onSubmit={handlePatientSubmit} className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-name">Full Name</Label>
                      <Input
                        id="p-name"
                        placeholder="Enter your full name"
                        value={patientForm.name}
                        onChange={(e) =>
                          setPatientForm((p) => ({ ...p, name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-email">Email</Label>
                      <Input
                        id="p-email"
                        type="email"
                        placeholder="name@example.com"
                        value={patientForm.email}
                        onChange={(e) =>
                          setPatientForm((p) => ({ ...p, email: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="p-age">Age</Label>
                      <Input
                        id="p-age"
                        type="number"
                        placeholder="Age"
                        min="1"
                        max="120"
                        value={patientForm.age}
                        onChange={(e) =>
                          setPatientForm((p) => ({ ...p, age: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-gender">Gender</Label>
                      <Select
                        value={patientForm.gender}
                        onValueChange={(v) =>
                          setPatientForm((p) => ({
                            ...p,
                            gender: v as "male" | "female" | "other",
                          }))
                        }
                      >
                        <SelectTrigger id="p-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-phone">Phone</Label>
                      <Input
                        id="p-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={patientForm.phone}
                        onChange={(e) =>
                          setPatientForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Existing Diseases (Optional)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={diseaseInput}
                        onValueChange={(v) => addDisease(v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select or type disease" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_DISEASES.filter(
                            (d) => !patientForm.diseases.includes(d)
                          ).map((disease) => (
                            <SelectItem key={disease} value={disease}>
                              {disease}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {patientForm.diseases.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {patientForm.diseases.map((disease) => (
                          <Badge
                            key={disease}
                            variant="secondary"
                            className="gap-1"
                          >
                            {disease}
                            <button
                              type="button"
                              onClick={() => removeDisease(disease)}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Location</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => detectLocation("patient")}
                        disabled={isDetectingLocation}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {isDetectingLocation ? "Detecting..." : "Auto Detect"}
                      </Button>
                    </div>
                    <Input
                      placeholder="Address"
                      value={patientForm.address}
                      onChange={(e) =>
                        setPatientForm((p) => ({
                          ...p,
                          address: e.target.value,
                        }))
                      }
                      required
                    />
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        placeholder="City"
                        value={patientForm.city}
                        onChange={(e) =>
                          setPatientForm((p) => ({ ...p, city: e.target.value }))
                        }
                        required
                      />
                      <Input
                        placeholder="State"
                        value={patientForm.state}
                        onChange={(e) =>
                          setPatientForm((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        placeholder="Pincode"
                        value={patientForm.pincode}
                        onChange={(e) =>
                          setPatientForm((p) => ({
                            ...p,
                            pincode: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-password">Password</Label>
                      <Input
                        id="p-password"
                        type="password"
                        placeholder="Create a password"
                        value={patientForm.password}
                        onChange={(e) =>
                          setPatientForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-confirm">Confirm Password</Label>
                      <Input
                        id="p-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={patientForm.confirmPassword}
                        onChange={(e) =>
                          setPatientForm((p) => ({
                            ...p,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Patient Account"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Hospital Registration Form */}
              <TabsContent value="hospital">
                <form
                  onSubmit={handleHospitalSubmit}
                  className="space-y-4 pt-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="h-name">Hospital Name</Label>
                      <Input
                        id="h-name"
                        placeholder="Enter hospital name"
                        value={hospitalForm.name}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="h-email">Email</Label>
                      <Input
                        id="h-email"
                        type="email"
                        placeholder="hospital@example.com"
                        value={hospitalForm.email}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="h-phone">Phone</Label>
                      <Input
                        id="h-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={hospitalForm.phone}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="h-radius">Service Radius (km)</Label>
                      <Input
                        id="h-radius"
                        type="number"
                        placeholder="15"
                        min="1"
                        value={hospitalForm.serviceRadius}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            serviceRadius: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Location</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => detectLocation("hospital")}
                        disabled={isDetectingLocation}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {isDetectingLocation ? "Detecting..." : "Auto Detect"}
                      </Button>
                    </div>
                    <Input
                      placeholder="Address"
                      value={hospitalForm.address}
                      onChange={(e) =>
                        setHospitalForm((p) => ({
                          ...p,
                          address: e.target.value,
                        }))
                      }
                      required
                    />
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        placeholder="City"
                        value={hospitalForm.city}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            city: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        placeholder="State"
                        value={hospitalForm.state}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        placeholder="Pincode"
                        value={hospitalForm.pincode}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            pincode: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="h-emergency">Emergency Beds</Label>
                      <Input
                        id="h-emergency"
                        type="number"
                        placeholder="20"
                        min="0"
                        value={hospitalForm.emergencyCapacity}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            emergencyCapacity: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="h-non-emergency">Non-Emergency Beds</Label>
                      <Input
                        id="h-non-emergency"
                        type="number"
                        placeholder="50"
                        min="0"
                        value={hospitalForm.nonEmergencyCapacity}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            nonEmergencyCapacity: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="h-min">Min Consultation (INR)</Label>
                      <Input
                        id="h-min"
                        type="number"
                        placeholder="300"
                        min="0"
                        value={hospitalForm.minConsultation}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            minConsultation: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="h-max">Max Consultation (INR)</Label>
                      <Input
                        id="h-max"
                        type="number"
                        placeholder="1500"
                        min="0"
                        value={hospitalForm.maxConsultation}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            maxConsultation: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="h-emergency-charge">
                        Emergency Charges (INR)
                      </Label>
                      <Input
                        id="h-emergency-charge"
                        type="number"
                        placeholder="5000"
                        min="0"
                        value={hospitalForm.emergencyCharges}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            emergencyCharges: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="h-password">Password</Label>
                      <Input
                        id="h-password"
                        type="password"
                        placeholder="Create a password"
                        value={hospitalForm.password}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="h-confirm">Confirm Password</Label>
                      <Input
                        id="h-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={hospitalForm.confirmPassword}
                        onChange={(e) =>
                          setHospitalForm((p) => ({
                            ...p,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Hospital Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
