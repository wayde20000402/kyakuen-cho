import { google } from "googleapis";
import { Customer } from "./supabase";

export function getOAuthClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export async function readSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName = "客縁帳"
): Promise<Partial<Customer>[]> {
  const auth = getOAuthClient(accessToken);
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:P`,
  });

  const rows = res.data.values ?? [];

  return rows.map((row, index) => ({
    name:         row[0] || "",
    nickname:     row[1] || "",
    vip:          (row[2] as Customer["vip"]) || "merchant",
    status:       (row[3] as Customer["status"]) || "active",
    trust:        parseInt(row[4]) || 50,
    phone:        row[5] || "",
    telegram:     row[6] || "",
    instagram:    row[7] || "",
    location:     row[8] || "",
    tags:         row[9] ? row[9].split(",").map((t: string) => t.trim()) : [],
    notes:        row[10] || "",
    purchases:    parseInt(row[11]) || 0,
    referrals:    parseInt(row[12]) || 0,
    last_contact: row[13] || "",
    sheets_row:   index + 2,
  }));
}

export async function writeCustomerToSheet(
  accessToken: string,
  spreadsheetId: string,
  customer: Customer,
  sheetName = "客縁帳"
) {
  const auth = getOAuthClient(accessToken);
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    customer.name,
    customer.nickname ?? "",
    customer.vip,
    customer.status,
    customer.trust,
    customer.phone ?? "",
    customer.telegram ?? "",
    customer.instagram ?? "",
    customer.location ?? "",
    customer.tags.join(","),
    customer.notes ?? "",
    customer.purchases,
    customer.referrals,
    customer.last_contact ?? "",
  ];

  if (customer.sheets_row) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${customer.sheets_row}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  }
}

export async function initializeSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName = "客縁帳"
) {
  const auth = getOAuthClient(accessToken);
  const sheets = google.sheets({ version: "v4", auth });

  const headers = [
    "姓名", "別名", "階級", "状態", "信頼度",
    "電話", "Telegram", "Instagram", "所在地",
    "符籙(標籤)", "記録(備注)", "購入回数", "紹介数", "最終連絡",
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [headers] },
  });
}
