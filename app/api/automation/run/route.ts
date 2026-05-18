import { NextResponse } from "next/server";
import { runAutomation } from "@/lib/supabase";

export async function POST() {
  const updated = await runAutomation();
  return NextResponse.json({ updated, message: `${updated} 件の記録を更新しました` });
}
