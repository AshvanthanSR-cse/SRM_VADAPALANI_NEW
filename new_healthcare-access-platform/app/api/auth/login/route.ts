import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { Patient, HospitalAccount, HealthcareFacility } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role === "patient") {
      const patient = await queryOne<Patient>(
        `SELECT * FROM Users_Patient WHERE email = $1`,
        [email]
      );

      if (!patient) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(
        password,
        patient.password_hash
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: patient.patient_id,
          name: patient.full_name,
          email: patient.email,
          role: "patient",
        },
      });
    } else if (role === "hospital") {
      // For hospitals, username is used instead of email
      const account = await queryOne<HospitalAccount & { name: string }>(
        `
        SELECT ha.*, hf.name 
        FROM Hospital_Accounts ha
        JOIN Healthcare_Facilities hf ON ha.facility_id = hf.facility_id
        WHERE ha.username = $1
        `,
        [email]
      );

      if (!account) {
        return NextResponse.json(
          { success: false, error: "Invalid username or password" },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(
        password,
        account.password_hash
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Invalid username or password" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: account.account_id,
          name: account.name,
          email: account.username,
          role: "hospital",
          facility_id: account.facility_id,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
