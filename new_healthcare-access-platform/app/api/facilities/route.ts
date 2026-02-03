import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { HealthcareFacility, FacilityWithDetails } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emergency = searchParams.get("emergency");
    const specialty = searchParams.get("specialty");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const maxDistance = searchParams.get("maxDistance");

    let sql = `
      SELECT 
        hf.*,
        ha.consultation_fee
      FROM Healthcare_Facilities hf
      LEFT JOIN Hospital_Accounts ha ON hf.facility_id = ha.facility_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (emergency === "true") {
      sql += ` AND hf.emergency_available = true`;
    } else if (emergency === "false") {
      sql += ` AND hf.emergency_available = false`;
    }

    if (specialty) {
      sql += ` AND hf.specialties ILIKE $${paramIndex}`;
      params.push(`%${specialty}%`);
      paramIndex++;
    }

    sql += ` ORDER BY hf.name ASC`;

    const facilities = await query<FacilityWithDetails>(sql, params);

    // Calculate distance if user location is provided
    if (lat && lon) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);

      facilities.forEach((facility) => {
        facility.distance = calculateDistance(
          userLat,
          userLon,
          facility.lat,
          facility.lon
        );
      });

      // Filter by max distance if specified
      if (maxDistance) {
        const maxDist = parseFloat(maxDistance);
        const filtered = facilities.filter(
          (f) => f.distance && f.distance <= maxDist
        );
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        return NextResponse.json({ success: true, data: filtered });
      }

      // Sort by distance
      facilities.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
