import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { Patient, HealthcareFacility, HospitalAccount } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (role === "patient") {
      const { full_name, email, phone, password } = body;

      if (!full_name || !email || !password) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existing = await queryOne<Patient>(
        `SELECT patient_id FROM Users_Patient WHERE email = $1`,
        [email]
      );

      if (existing) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 409 }
        );
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert new patient
      const result = await query<Patient>(
        `INSERT INTO Users_Patient (full_name, email, phone, password_hash) 
         VALUES ($1, $2, $3, $4) 
         RETURNING patient_id, full_name, email`,
        [full_name, email, phone || null, password_hash]
      );

      const newPatient = result[0];

      return NextResponse.json({
        success: true,
        data: {
          id: newPatient.patient_id,
          name: newPatient.full_name,
          email: newPatient.email,
          role: "patient",
        },
      });
    } else if (role === "hospital") {
      const {
        name,
        username,
        password,
        total_beds,
        emergency_available,
        lat,
        lon,
        specialties,
        operating_hours,
        consultation_fee,
      } = body;

      if (!name || !username || !password || !lat || !lon) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if username already exists
      const existingAccount = await queryOne<HospitalAccount>(
        `SELECT account_id FROM Hospital_Accounts WHERE username = $1`,
        [username]
      );

      if (existingAccount) {
        return NextResponse.json(
          { success: false, error: "Username already taken" },
          { status: 409 }
        );
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert new facility
      const facilityResult = await query<HealthcareFacility>(
        `INSERT INTO Healthcare_Facilities (name, total_beds, emergency_available, lat, lon, specialties, operating_hours) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING facility_id, name`,
        [
          name,
          total_beds || 0,
          emergency_available || false,
          lat,
          lon,
          specialties || "",
          operating_hours || "9:00 AM - 5:00 PM",
        ]
      );

      const newFacility = facilityResult[0];

      // Insert hospital account
      const accountResult = await query<HospitalAccount>(
        `INSERT INTO Hospital_Accounts (facility_id, username, password_hash, consultation_fee) 
         VALUES ($1, $2, $3, $4) 
         RETURNING account_id`,
        [newFacility.facility_id, username, password_hash, consultation_fee || 0]
      );

      const newAccount = accountResult[0];

      return NextResponse.json({
        success: true,
        data: {
          id: newAccount.account_id,
          name: newFacility.name,
          email: username,
          role: "hospital",
          facility_id: newFacility.facility_id,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
