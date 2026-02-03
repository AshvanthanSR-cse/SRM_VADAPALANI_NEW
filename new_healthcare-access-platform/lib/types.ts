// Database types matching PostgreSQL schema

export interface AreaDetails {
  area_id: string;
  state: string;
  district: string;
  taluk: string;
  area_name: string;
  area_type: string;
  population: number;
  latitude: number;
  longitude: number;
}

export interface HealthStatistics {
  record_id: number;
  area_id: string;
  disease_name: string;
  monthly_cases: number;
  record_date: Date;
}

export interface AIPrediction {
  prediction_id: number;
  area_id: string;
  overload_risk: number;
  predicted_load: number;
  prediction_date: Date;
}

export interface HealthcareFacility {
  facility_id: number;
  name: string;
  total_beds: number;
  emergency_available: boolean;
  lat: number;
  lon: number;
  specialties: string;
  operating_hours: string;
}

export interface HospitalAccount {
  account_id: number;
  facility_id: number;
  username: string;
  password_hash: string;
  consultation_fee: number;
}

export interface Patient {
  patient_id: number;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  created_at: Date;
}

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  facility_id: number;
  appointment_date: Date;
  status: "Booked" | "Completed" | "Cancelled";
  payment_status: "Pending" | "Paid" | "Failed";
}

// Extended types for frontend use
export interface FacilityWithDetails extends HealthcareFacility {
  consultation_fee?: number;
  distance?: number;
  available_beds?: number;
}

export interface AppointmentWithDetails extends Appointment {
  facility_name?: string;
  facility_specialties?: string;
  patient_name?: string;
  patient_email?: string;
}

// Auth types
export type UserRole = "patient" | "hospital";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  facility_id?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface PatientRegistration {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface HospitalRegistration {
  name: string;
  username: string;
  password: string;
  total_beds: number;
  emergency_available: boolean;
  lat: number;
  lon: number;
  specialties: string;
  operating_hours: string;
  consultation_fee: number;
}

// Filter types
export interface HospitalFilters {
  emergency?: boolean;
  specialty?: string;
  maxDistance?: number;
  sortBy?: "distance" | "beds" | "fee";
}

// Map types
export interface MapMarker {
  id: string;
  type: "user" | "hospital-emergency" | "hospital-non-emergency";
  position: [number, number];
  data: HealthcareFacility | null;
  isAvailable: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Common disease categories for suggestions
export const COMMON_DISEASES = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Arthritis",
  "Thyroid Disorders",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
  "Allergies",
  "Migraine",
  "Depression",
  "Anxiety",
  "COPD",
  "Obesity",
] as const;

// Doctor specializations
export const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Gynecologist",
  "Dermatologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Psychiatrist",
  "Endocrinologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Nephrologist",
  "Oncologist",
  "Urologist",
  "Dentist",
  "General Surgeon",
] as const;

// Disease to specialization mapping for smart suggestions
export const DISEASE_SPECIALIZATION_MAP: Record<string, string[]> = {
  Diabetes: ["Endocrinologist", "General Physician"],
  Hypertension: ["Cardiologist", "General Physician"],
  "Heart Disease": ["Cardiologist"],
  Asthma: ["Pulmonologist", "General Physician"],
  Arthritis: ["Orthopedic", "General Physician"],
  "Thyroid Disorders": ["Endocrinologist"],
  "Kidney Disease": ["Nephrologist"],
  "Liver Disease": ["Gastroenterologist"],
  Cancer: ["Oncologist"],
  Allergies: ["General Physician", "Dermatologist"],
  Migraine: ["Neurologist", "General Physician"],
  Depression: ["Psychiatrist"],
  Anxiety: ["Psychiatrist"],
  COPD: ["Pulmonologist"],
  Obesity: ["Endocrinologist", "General Physician"],
};
