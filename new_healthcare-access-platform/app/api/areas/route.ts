import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { AreaDetails } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const areaType = searchParams.get("areaType");

    let sql = `SELECT * FROM Area_Details WHERE 1=1`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (state) {
      sql += ` AND state = $${paramIndex}`;
      params.push(state);
      paramIndex++;
    }

    if (district) {
      sql += ` AND district = $${paramIndex}`;
      params.push(district);
      paramIndex++;
    }

    if (areaType) {
      sql += ` AND area_type = $${paramIndex}`;
      params.push(areaType);
      paramIndex++;
    }

    sql += ` ORDER BY area_name ASC`;

    const areas = await query<AreaDetails>(sql, params);

    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
