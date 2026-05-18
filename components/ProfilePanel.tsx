"use client";
import { useState } from "react";
import { Customer, upsertCustomer } from "@/lib/supabase";

const VIP_META: Record<string, { icon:string; color:string; label:string }> = {
  shogun:   { icon:"🏯", color:"#c0392b", label:"将軍" },
  daimyo:   { icon:"👑", color:"#c9a84c", label:"大名" },
  samurai:  { icon:"⚔️", color:"#1a3a5c", label:"武士" },
  merchant: { icon:"⚖️", color:"#8b7355", label:"商人" },
};
const STATUS_META: Record<string, { color:string; label:string }> = {
  active:    { color:"#2d6a4f", label:"活躍" },
  sleeping:  { color:"#8b7355", label:"休眠" },
  blacklist: { color:"#c0392b", label:"封印" },
};

interface Props {
  customer: Customer;
  onClose: () => void;
  onUpdate: (c: Customer) => void;
}

export default function ProfilePanel({ customer: c, onClose, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(c);
  const [saving, setSaving] = useState(false);

  const vip = VIP_META[c.vip] ?? VIP_META.merchant;
  const status = STATUS_META[c.status] ?? STATUS_META.active;

  const save = async () => {
    setSaving(true);
    const updated = await upsertCustomer(form);
    onUpdate(updated);
    setEditing(false);
    setSaving(false);
  };

  return (
    <div className="slide-in-right" style={{
      width:320, flexShrink:0,
      background:"linear-gradient(160deg,#1e1008,#2a1a0f)",
      borderLeft:"1px solid rgba(201,168,76,0.3)",
      display:"flex", flexDirection:"column",
      fontFamily:"serif", overflowY:"auto",
    }}>
      <div style={{ height:5, background:"repeating-linear-gradient(90deg,#c0392b 0,#c0392b 12px,#c9a84c 12px,#c9a84c 24px)", flexShrink:0 }}/>

      <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid rgba(201,168,76,0.2)", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:48, height:48, borderRadius:4,
              background:`radial-gradient(circle,${vip.color}22,${vip.color}11)`,
              border:`1.5px solid ${vip.color}66`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
            }}>{vip.icon}</div>
            <div>
              <div style={{ fontSize:16, fontWeight:"bold", color:"#f5e6c8" }}>{c.name}</div>
              <div style={{ fontSize:11, color:vip.color }}>「{c.nickname || "—"}」</div>
              <div style={{ display:"flex", gap:4, marginTop:4 }}>
                <span style={{ background:vip.color, color:"#1a0f0a", fontSize:9, padding:"1px 7px", borderRadius:2 }}>{vip.label}</span>
                <span style={{ background:status.color, color:"white", fontSize:9, padding:"1px 7px", borderRadius:2 }}>{status.label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"1px solid rgba(201,168,76,0.3)",
            color:"rgba(201,168,76,0.6)", cursor:"pointer", borderRadius:3,
            padding:"2px 8px", fontSize:11, fontFamily:"serif",
          }}>✕</button>
        </div>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ fontSize:9, color:"rgba(201,168,76,0.5)" }}>信頼度</span>
            <span style={{ fontSize:11, fontWeight:"bold", color:vip.color }}>{c.trust}/100</span>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,0.1)", borderRadius:3 }}>
            <div style={{ width:`${c.trust}%`, height:"100%", borderRadius:3, background:`linear-gradient(90deg,${vip.color},#c9a84c)` }}/>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:"1px solid rgba(201,168,76,0.15)", flexShrink:0 }}>
        {[
          { l:"購入回数", v:`${c.purchases}回` },
          { l:"紹介数",   v:`${c.referrals}人` },
          { l:"最終連絡", v:c.last_contact?.slice(5) ?? "—" },
        ].map(s => (
          <div key={s.l} style={{ padding:"10px 6px", textAlign:"center", borderRight:"1px solid rgba(201,168,76,0.1)" }}>
            <div style={{ fontSize:14, fontWeight:"bold", color:"#c9a84c" }}>{s.v}</div>
            <div style={{ fontSize:8, color:"rgba(201,168,76,0.4)", marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"16px 20px", flex:1 }}>
        {[
          { k:"phone" as keyof Customer,     l:"📱 電話番号" },
          { k:"telegram" as keyof Customer,  l:"✈️ Telegram" },
          { k:"instagram" as keyof Customer, l:"🌸 Instagram" },
          { k:"location" as keyof Customer,  l:"🏯 所在地" },
        ].map(row => (
          <div key={row.k} style={{ marginBottom:10 }}>
            <div style={{ fontSize:9, color:"rgba(201,168,76,0.6)", marginBottom:3 }}>{row.l}</div>
            {editing ? (
              <input value={(form as any)[row.k] ?? ""} onChange={e => setForm(f => ({ ...f, [row.k]: e.target.value }))}
                style={{ width:"100%", padding:"5px 8px", background:"rgba(245,230,200,0.1)", border:"1px solid rgba(201,168,76,0.4)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif" }}/>
            ) : (
              <div style={{ fontSize:12, color:"#f5e6c8", lineHeight:1.5 }}>{(c as any)[row.k] || <span style={{ opacity:0.3 }}>—</span>}</div>
            )}
          </div>
        ))}

        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:9, color:"rgba(201,168,76,0.6)", marginBottom:6 }}>符籙 (タグ)</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {(editing ? form : c).tags?.map(t => (
              <span key={t} style={{ background:"rgba(26,58,92,0.4)", color:"#6a9cc9", border:"1px solid rgba(26,58,92,0.6)", fontSize:10, padding:"2px 8px", borderRadius:2 }}>#{t}</span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize:9, color:"rgba(201,168,76,0.6)", marginBottom:6 }}>記録 (備注)</div>
          {editing ? (
            <textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ width:"100%", minHeight:80, padding:"8px", background:"rgba(245,230,200,0.05)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif", resize:"vertical" }}/>
          ) : (
            <div style={{ background:"rgba(245,230,200,0.04)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:4, padding:"10px 12px", fontSize:12, color:"rgba(245,230,200,0.8)", lineHeight:1.7 }}>
              {c.notes || <span style={{ opacity:0.3 }}>記録なし</span>}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:"12px 20px 16px", borderTop:"1px solid rgba(201,168,76,0.15)", flexShrink:0, display:"flex", gap:8 }}>
        {editing ? (
          <>
            <button onClick={save} disabled={saving} style={{ flex:1, padding:"9px", background:"linear-gradient(135deg,#2d6a4f,#1e4d38)", border:"none", color:"white", cursor:"pointer", fontSize:12, fontFamily:"serif", borderRadius:3 }}>
              {saving ? "保存中…" : "✓ 保存する"}
            </button>
            <button onClick={() => { setEditing(false); setForm(c); }} style={{ padding:"9px 14px", background:"none", border:"1px solid rgba(201,168,76,0.3)", color:"rgba(201,168,76,0.7)", cursor:"pointer", fontFamily:"serif", borderRadius:3 }}>
              取消
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} style={{ flex:1, padding:"9px", background:"linear-gradient(135deg,#1a3a5c,#2a4a7c)", border:"none", color:"rgba(201,168,76,0.9)", cursor:"pointer", fontSize:12, fontFamily:"serif", borderRadius:3 }}>
            ✏️ 編集する
          </button>
        )}
      </div>
      <div style={{ height:5, background:"repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 12px,#c0392b 12px,#c0392b 24px)", flexShrink:0 }}/>
    </div>
  );
}
