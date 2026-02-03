import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { HealthStatistics } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get("areaId");
    const diseaseName = searchParams.get("diseaseName");

    let sql = `
      SELECT hs.*, ad.area_name, ad.district, ad.state
      FROM Health_Statistics hs
      JOIN Area_Details ad ON hs.area_id = ad.area_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (areaId) {
      sql += ` AND hs.area_id = $${paramIndex}`;
      params.push(areaId);
      paramIndex++;
    }

    if (diseaseName) {
      sql += ` AND hs.disease_name ILIKE $${paramIndex}`;
      params.push(`%${diseaseName}%`);
      paramIndex++;
    }

    sql += ` ORDER BY hs.record_date DESC`;

    const statistics = await query<HealthStatistics>(sql, params);

    return NextResponse.json({ success: true, data: statistics });
  } catch (error) {
    console.error("Error fetching health statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch health statistics" },
      { status: 500 }
    );
  }
}
