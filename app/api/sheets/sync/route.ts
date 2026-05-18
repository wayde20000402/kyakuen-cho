import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readSheet, writeCustomerToSheet, initializeSheet } from "@/lib/sheets";
import { upsertCustomer, getCustomers } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession() as any;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { spreadsheetId, direction } = await req.json();

  if (direction === "sheets-to-db") {
    const rows = await readSheet(session.accessToken, spreadsheetId);
    for (const row of rows) {
      if (!row.name) continue;
      await upsertCustomer({
        ...row,
        id: row.id ?? crypto.randomUUID(),
        pos_x: 400 + Math.random() * 400,
        pos_y: 200 + Math.random() * 400,
        tags: row.tags ?? [],
        purchases: row.purchases ?? 0,
        referrals: row.referrals ?? 0,
        trust: row.trust ?? 50,
        vip: row.vip ?? "merchant",
        status: row.status ?? "active",
      });
    }
    return NextResponse.json({ synced: rows.length });
  }

  if (direction === "db-to-sheets") {
    await initializeSheet(session.accessToken, spreadsheetId);
    const customers = await getCustomers();
    for (const c of customers) {
      await writeCustomerToSheet(session.accessToken, spreadsheetId, c);
    }
    return NextResponse.json({ pushed: customers.length });
  }

  return NextResponse.json({ error: "direction 參數錯誤" }, { status: 400 });
}
