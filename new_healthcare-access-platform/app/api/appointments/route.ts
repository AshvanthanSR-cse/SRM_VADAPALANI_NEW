import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { AppointmentWithDetails } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status");

    let sql = `
      SELECT 
        a.*,
        hf.name as facility_name,
        hf.specialties as facility_specialties,
        up.full_name as patient_name,
        up.email as patient_email
      FROM Appointments a
      JOIN Healthcare_Facilities hf ON a.facility_id = hf.facility_id
      JOIN Users_Patient up ON a.patient_id = up.patient_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (patientId) {
      sql += ` AND a.patient_id = $${paramIndex}`;
      params.push(patientId);
      paramIndex++;
    }

    if (facilityId) {
      sql += ` AND a.facility_id = $${paramIndex}`;
      params.push(facilityId);
      paramIndex++;
    }

    if (status) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY a.appointment_date DESC`;

    const appointments = await query<AppointmentWithDetails>(sql, params);

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_id, facility_id, appointment_date } = body;

    if (!patient_id || !facility_id || !appointment_date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query<AppointmentWithDetails>(
      `INSERT INTO Appointments (patient_id, facility_id, appointment_date, status, payment_status) 
       VALUES ($1, $2, $3, 'Booked', 'Pending') 
       RETURNING *`,
      [patient_id, facility_id, appointment_date]
    );

    const newAppointment = result[0];

    // Get facility details
    const facilityDetails = await query<{ name: string; specialties: string }>(
      `SELECT name, specialties FROM Healthcare_Facilities WHERE facility_id = $1`,
      [facility_id]
    );

    if (facilityDetails[0]) {
      newAppointment.facility_name = facilityDetails[0].name;
      newAppointment.facility_specialties = facilityDetails[0].specialties;
    }

    return NextResponse.json({ success: true, data: newAppointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
