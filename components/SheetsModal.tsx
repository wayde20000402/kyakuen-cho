"use client";
import { useState } from "react";
import { Customer, getCustomers } from "@/lib/supabase";

interface Props {
  onClose: () => void;
  onSync: (customers: Customer[]) => void;
  session: any;
}

export default function SheetsModal({ onClose, onSync, session }: Props) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const extractId = (input: string) => {
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input;
  };

  const sync = async (direction: "sheets-to-db" | "db-to-sheets") => {
    const id = extractId(spreadsheetId);
    if (!id) { setStatus("❌ Sheets ID を入力してください"); return; }
    setLoading(true);
    setStatus("同期中…");
    try {
      const res = await fetch("/api/sheets/sync", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ spreadsheetId: id, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const count = data.synced ?? data.pushed;
      setStatus(`✓ ${count} 件を${direction === "sheets-to-db" ? "インポート" : "エクスポート"}しました`);
      if (direction === "sheets-to-db") {
        const fresh = await getCustomers();
        onSync(fresh);
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"linear-gradient(160deg,#1e1008,#2a1a0f)", border:"1px solid rgba(201,168,76,0.4)", borderRadius:8, width:420, fontFamily:"serif" }} onClick={e=>e.stopPropagation()} className="fade-up">
        <div style={{ height:5, background:"repeating-linear-gradient(90deg,#c0392b 0,#c0392b 12px,#c9a84c 12px,#c9a84c 24px)", borderRadius:"8px 8px 0 0" }}/>
        <div style={{ padding:"24px" }}>
          <h3 style={{ fontSize:15, color:"#c9a84c", marginBottom:6 }}>📊 Google Sheets 連携</h3>
          <p style={{ fontSize:11, color:"rgba(201,168,76,0.5)", marginBottom:20, lineHeight:1.6 }}>
            Google Sheets の URL または ID を入力してください。シートには「客縁帳」という名前のタブが必要です。
          </p>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:5 }}>Sheets URL または ID</label>
            <input value={spreadsheetId} onChange={e => setSpreadsheetId(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              style={{ width:"100%", padding:"8px 12px", background:"rgba(245,230,200,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:4, color:"#f5e6c8", fontSize:12, fontFamily:"serif" }}/>
          </div>
          {status && (
            <div style={{ padding:"8px 12px", marginBottom:16, borderRadius:4,
              background: status.startsWith("✓") ? "rgba(45,106,79,0.2)" : "rgba(192,57,43,0.2)",
              border: `1px solid ${status.startsWith("✓") ? "rgba(45,106,79,0.4)" : "rgba(192,57,43,0.4)"}`,
              color: status.startsWith("✓") ? "#4ade80" : "#f87171", fontSize:12 }}>
              {status}
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <button onClick={() => sync("sheets-to-db")} disabled={loading} style={{ padding:"12px 8px", background:"linear-gradient(135deg,rgba(26,58,92,0.8),rgba(42,74,124,0.8))", border:"1px solid rgba(26,58,92,0.6)", color:loading ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.9)", cursor: loading ? "not-allowed" : "pointer", fontSize:12, fontFamily:"serif", borderRadius:4, lineHeight:1.5 }}>
              ⬇ Sheets → アプリ<br/><span style={{ fontSize:9, opacity:0.6 }}>インポート</span>
            </button>
            <button onClick={() => sync("db-to-sheets")} disabled={loading} style={{ padding:"12px 8px", background:"linear-gradient(135deg,rgba(45,106,79,0.8),rgba(22,74,50,0.8))", border:"1px solid rgba(45,106,79,0.6)", color:loading ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.9)", cursor: loading ? "not-allowed" : "pointer", fontSize:12, fontFamily:"serif", borderRadius:4, lineHeight:1.5 }}>
              ⬆ アプリ → Sheets<br/><span style={{ fontSize:9, opacity:0.6 }}>エクスポート</span>
            </button>
          </div>
          <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:16, padding:"9px", background:"none", border:"1px solid rgba(201,168,76,0.2)", color:"rgba(201,168,76,0.5)", cursor:"pointer", fontSize:12, fontFamily:"serif", borderRadius:4 }}>
            閉じる
          </button>
        </div>
        <div style={{ height:5, background:"repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 12px,#c0392b 12px,#c0392b 24px)", borderRadius:"0 0 8px 8px" }}/>
      </div>
    </div>
  );
}
