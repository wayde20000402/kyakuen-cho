"use client";
import { Customer } from "@/lib/supabase";
import { useState } from "react";

const VIP_META: Record<string, { icon: string; color: string }> = {
  shogun:   { icon:"🏯", color:"#c0392b" },
  daimyo:   { icon:"👑", color:"#c9a84c" },
  samurai:  { icon:"⚔️", color:"#1a3a5c" },
  merchant: { icon:"⚖️", color:"#8b7355" },
};

export default function Sidebar({ customers }: { customers: Customer[] }) {
  const [automating, setAutomating] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const active    = customers.filter(c => c.status === "active").length;
  const sleeping  = customers.filter(c => c.status === "sleeping").length;
  const blacklist = customers.filter(c => c.status === "blacklist").length;
  const avgTrust  = customers.length
    ? Math.round(customers.reduce((a, c) => a + c.trust, 0) / customers.length)
    : 0;

  const vipCounts = Object.entries(VIP_META).map(([k, v]) => ({
    ...v, label: k, count: customers.filter(c => c.vip === k).length,
  }));

  const handleAutomate = async () => {
    setAutomating(true);
    try {
      const res = await fetch("/api/automation/run", { method:"POST" });
      const { updated } = await res.json();
      setLastRun(`${updated}件を更新`);
    } finally {
      setAutomating(false);
    }
  };

  return (
    <div style={{
      width:170, flexShrink:0,
      background:"linear-gradient(180deg,rgba(26,15,10,0.97),rgba(42,26,15,0.97))",
      borderRight:"1px solid rgba(201,168,76,0.25)",
      padding:"16px 12px", overflowY:"auto",
      display:"flex", flexDirection:"column", gap:10,
    }}>
      <div style={{ fontSize:8, color:"rgba(201,168,76,0.5)", letterSpacing:3, marginBottom:4 }}>
        王国の統計
      </div>

      {[
        { label:"活躍の者", val:active,    color:"#2d6a4f", icon:"✦" },
        { label:"休眠の者", val:sleeping,  color:"#8b7355", icon:"◈" },
        { label:"封印の者", val:blacklist, color:"#c0392b", icon:"✕" },
        { label:"総人数",   val:customers.length, color:"#c9a84c", icon:"◉" },
        { label:"平均信頼", val:avgTrust,  color:"#1a3a5c", icon:"⊕" },
      ].map(s => (
        <div key={s.label} style={{
          background:"rgba(255,255,255,0.03)",
          border:`1px solid ${s.color}33`, borderRadius:4, padding:"8px 10px",
        }}>
          <div style={{ fontSize:8, color:`${s.color}99` }}>{s.icon} {s.label}</div>
          <div style={{ fontSize:20, fontWeight:"bold", color:s.color, marginTop:2 }}>{s.val}</div>
        </div>
      ))}

      <div style={{ marginTop:4 }}>
        <div style={{ fontSize:8, color:"rgba(201,168,76,0.5)", letterSpacing:2, marginBottom:6 }}>階級分布</div>
        {vipCounts.map(v => (
          <div key={v.label} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize:11 }}>{v.icon}</span>
            <span style={{ fontSize:10, color:`${v.color}cc`, flex:1, marginLeft:6 }}>{v.label}</span>
            <span style={{ fontSize:12, fontWeight:"bold", color:v.color }}>{v.count}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop:"auto" }}>
        <div style={{ fontSize:8, color:"rgba(201,168,76,0.5)", letterSpacing:2, marginBottom:6 }}>自動化</div>
        <button onClick={handleAutomate} disabled={automating} style={{
          width:"100%", padding:"8px 4px",
          background: automating ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,rgba(26,58,92,0.8),rgba(42,74,124,0.8))",
          border:"1px solid rgba(26,58,92,0.5)",
          color: automating ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.9)",
          cursor: automating ? "not-allowed" : "pointer",
          fontSize:10, fontFamily:"serif", borderRadius:3, lineHeight:1.4,
        }}>
          {automating ? "⟳ 実行中…" : "⚡ 自動整理を実行"}
        </button>
        {lastRun && (
          <div style={{ fontSize:9, color:"#2d6a4f", textAlign:"center", marginTop:4 }}>✓ {lastRun}</div>
        )}
      </div>
    </div>
  );
}
