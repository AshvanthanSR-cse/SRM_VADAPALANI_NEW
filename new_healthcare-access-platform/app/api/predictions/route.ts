import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { AIPrediction } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get("areaId");

    let sql = `
      SELECT ap.*, ad.area_name, ad.district, ad.state
      FROM AI_Predictions ap
      JOIN Area_Details ad ON ap.area_id = ad.area_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (areaId) {
      sql += ` AND ap.area_id = $${paramIndex}`;
      params.push(areaId);
      paramIndex++;
    }

    sql += ` ORDER BY ap.prediction_date DESC`;

    const predictions = await query<AIPrediction>(sql, params);

    return NextResponse.json({ success: true, data: predictions });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
