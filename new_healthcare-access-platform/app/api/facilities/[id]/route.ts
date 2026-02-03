import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import type { FacilityWithDetails } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const facility = await queryOne<FacilityWithDetails>(
      `
      SELECT 
        hf.*,
        ha.consultation_fee
      FROM Healthcare_Facilities hf
      LEFT JOIN Hospital_Accounts ha ON hf.facility_id = ha.facility_id
      WHERE hf.facility_id = $1
      `,
      [id]
    );

    if (!facility) {
      return NextResponse.json(
        { success: false, error: "Facility not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    console.error("Error fetching facility:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facility" },
      { status: 500 }
    );
  }
}
