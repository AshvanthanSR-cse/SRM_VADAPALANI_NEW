"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Appointment } from "@/lib/types";

interface AppointmentsContextType {
  appointments: Appointment[];
  isLoading: boolean;
  createAppointment: (
    data: Omit<Appointment, "id" | "createdAt" | "status">
  ) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByHospital: (hospitalId: string) => Appointment[];
  updateAppointmentStatus: (
    id: string,
    status: Appointment["status"]
  ) => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "medicare_appointments";

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveAppointments = (apps: Appointment[]) => {
    setAppointments(apps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  };

  const createAppointment = async (
    data: Omit<Appointment, "id" | "createdAt" | "status">
  ): Promise<Appointment> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newAppointment: Appointment = {
      ...data,
      id: `apt_${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    };

    saveAppointments([...appointments, newAppointment]);
    return newAppointment;
  };

  const cancelAppointment = async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: "cancelled" as const } : apt
    );
    saveAppointments(updated);
  };

  const getAppointmentsByPatient = (patientId: string): Appointment[] => {
    return appointments.filter((apt) => apt.patientId === patientId);
  };

  const getAppointmentsByHospital = (hospitalId: string): Appointment[] => {
    return appointments.filter((apt) => apt.hospitalId === hospitalId);
  };

  const updateAppointmentStatus = async (
    id: string,
    status: Appointment["status"]
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status } : apt
    );
    saveAppointments(updated);
  };

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        createAppointment,
        cancelAppointment,
        getAppointmentsByPatient,
        getAppointmentsByHospital,
        updateAppointmentStatus,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error(
      "useAppointments must be used within an AppointmentsProvider"
    );
  }
  return context;
}
