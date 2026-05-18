"use client";
import { signOut } from "next-auth/react";
import { Customer } from "@/lib/supabase";

const FILTERS = [
  { key:"all",       label:"全員" },
  { key:"shogun",    label:"🏯 将軍" },
  { key:"daimyo",    label:"👑 大名" },
  { key:"samurai",   label:"⚔️ 武士" },
  { key:"merchant",  label:"⚖️ 商人" },
  { key:"sleeping",  label:"💤 休眠" },
  { key:"blacklist", label:"🚫 封印" },
];

interface Props {
  filter: string;
  onFilterChange: (f: string) => void;
  onAdd: () => void;
  onSheetsOpen: () => void;
  customers: Customer[];
  session: any;
}

export default function TopBar({ filter, onFilterChange, onAdd, onSheetsOpen, customers, session }: Props) {
  return (
    <div style={{
      position:"absolute", top:0, left:0, right:0, height:56, zIndex:100,
      background:"linear-gradient(90deg,#1a0f0a,#2a1a0f,#1a0f0a)",
      borderBottom:"1px solid rgba(201,168,76,0.3)",
      display:"flex", alignItems:"center", padding:"0 16px", gap:12,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:16, flexShrink:0 }}>
        <span style={{ fontSize:20 }}>⛩</span>
        <div>
          <div style={{ fontSize:14, fontWeight:"bold", color:"#c9a84c", letterSpacing:2 }}>客縁帳</div>
          <div style={{ fontSize:8, color:"rgba(201,168,76,0.5)", letterSpacing:3 }}>KYAKUEN-CHO</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:4, overflowX:"auto", flex:1 }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => onFilterChange(f.key)} style={{
            padding:"4px 10px", whiteSpace:"nowrap", flexShrink:0,
            background: filter === f.key
              ? "linear-gradient(135deg,#c9a84c,#a88030)"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${filter === f.key ? "#c9a84c" : "rgba(201,168,76,0.25)"}`,
            color: filter === f.key ? "#1a0f0a" : "rgba(201,168,76,0.8)",
            cursor:"pointer", fontSize:11, fontFamily:"serif", borderRadius:3,
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
        <button onClick={onSheetsOpen} style={{
          padding:"5px 12px",
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(201,168,76,0.3)",
          color:"rgba(201,168,76,0.8)",
          cursor:"pointer", fontSize:11, fontFamily:"serif", borderRadius:3,
        }}>
          📊 Sheets
        </button>
        <button onClick={onAdd} style={{
          padding:"5px 14px",
          background:"linear-gradient(135deg,#c0392b,#9b2335)",
          border:"none", color:"white",
          cursor:"pointer", fontSize:11, fontFamily:"serif", borderRadius:3,
          boxShadow:"0 0 12px rgba(192,57,43,0.4)",
        }}>
          ⛩ 新規登録
        </button>
        {session?.user?.image && (
          <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}
            onClick={() => signOut()}>
            <img src={session.user.image} alt="" style={{ width:28, height:28, borderRadius:"50%", border:"1px solid rgba(201,168,76,0.4)" }}/>
            <span style={{ fontSize:9, color:"rgba(201,168,76,0.5)" }}>退出</span>
          </div>
        )}
      </div>
    </div>
  );
}
