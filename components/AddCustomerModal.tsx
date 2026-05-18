"use client";
import { useState } from "react";
import { Customer, upsertCustomer } from "@/lib/supabase";

interface Props {
  customers: Customer[];
  onClose: () => void;
  onAdd: (c: Customer) => void;
}

export default function AddCustomerModal({ customers, onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    name:"", nickname:"", vip:"merchant" as Customer["vip"],
    status:"active" as Customer["status"],
    trust:50, phone:"", telegram:"", instagram:"",
    location:"", tags:"", notes:"", parent_id:"",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const newC = await upsertCustomer({
      id: crypto.randomUUID(),
      name: form.name, nickname: form.nickname,
      vip: form.vip, status: form.status,
      trust: Number(form.trust),
      phone: form.phone, telegram: form.telegram,
      instagram: form.instagram, location: form.location,
      tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean),
      notes: form.notes,
      parent_id: form.parent_id || null,
      purchases: 0, referrals: 0,
      last_contact: new Date().toISOString().slice(0,10),
      pos_x: 300 + Math.random() * 400,
      pos_y: 200 + Math.random() * 300,
    });
    onAdd(newC);
    setSaving(false);
    onClose();
  };

  const inp = (k: string, label: string, placeholder="") => (
    <div>
      <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:3 }}>{label}</label>
      <input value={(form as any)[k] ?? ""} onChange={e => set(k, e.target.value)} placeholder={placeholder || label}
        style={{ width:"100%", padding:"6px 10px", background:"rgba(245,230,200,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif" }}/>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"linear-gradient(160deg,#1e1008,#2a1a0f)", border:"1px solid rgba(201,168,76,0.4)", borderRadius:8, width:440, maxHeight:"85vh", overflowY:"auto", fontFamily:"serif" }} onClick={e=>e.stopPropagation()} className="fade-up">
        <div style={{ height:5, background:"repeating-linear-gradient(90deg,#c0392b 0,#c0392b 12px,#c9a84c 12px,#c9a84c 24px)", borderRadius:"8px 8px 0 0" }}/>
        <div style={{ padding:"20px 24px" }}>
          <h3 style={{ fontSize:15, color:"#c9a84c", marginBottom:16, letterSpacing:1 }}>⛩ 新たな縁者を登録する</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {inp("name","姓名 *")}
            {inp("nickname","別名")}
            {inp("phone","電話番号")}
            {inp("telegram","Telegram")}
            {inp("instagram","Instagram")}
            {inp("location","所在地")}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:3 }}>階級</label>
              <select value={form.vip} onChange={e=>set("vip",e.target.value)} style={{ width:"100%", padding:"6px 10px", background:"rgba(245,230,200,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif" }}>
                <option value="merchant">⚖️ 商人</option>
                <option value="samurai">⚔️ 武士</option>
                <option value="daimyo">👑 大名</option>
                <option value="shogun">🏯 将軍</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:3 }}>状態</label>
              <select value={form.status} onChange={e=>set("status",e.target.value)} style={{ width:"100%", padding:"6px 10px", background:"rgba(245,230,200,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif" }}>
                <option value="active">活躍</option>
                <option value="sleeping">休眠</option>
                <option value="blacklist">封印</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:3 }}>信頼度: {form.trust}</label>
            <input type="range" min={0} max={100} value={form.trust} onChange={e=>set("trust",Number(e.target.value))} style={{ width:"100%", accentColor:"#c9a84c" }}/>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:3 }}>上位縁者（紹介者）</label>
            <select value={form.parent_id} onChange={e=>set("parent_id",e.target.value)} style={{ width:"100%", padding:"6px 10px", background:"rgba(245,230,200,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif" }}>
              <option value="">— なし —</option>
              {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          {inp("tags","符籙（タグ、カンマ区切り）","VIP, 常客, ...")}
          <div style={{ marginTop:10 }}>
            <label style={{ fontSize:9, color:"rgba(201,168,76,0.6)", display:"block", marginBottom:3 }}>記録（備注）</label>
            <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} style={{ width:"100%", minHeight:60, padding:"6px 10px", background:"rgba(245,230,200,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:3, color:"#f5e6c8", fontSize:12, fontFamily:"serif", resize:"vertical" }}/>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={handleAdd} disabled={saving || !form.name} style={{ flex:1, padding:"10px", background: form.name ? "linear-gradient(135deg,#c0392b,#9b2335)" : "rgba(255,255,255,0.05)", border:"none", color:"white", cursor: form.name ? "pointer" : "not-allowed", fontSize:13, fontFamily:"serif", borderRadius:4 }}>
              {saving ? "登録中…" : "⛩ 登録する"}
            </button>
            <button onClick={onClose} style={{ padding:"10px 18px", background:"none", border:"1px solid rgba(201,168,76,0.3)", color:"rgba(201,168,76,0.7)", cursor:"pointer", fontFamily:"serif", borderRadius:4 }}>取消</button>
          </div>
        </div>
        <div style={{ height:5, background:"repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 12px,#c0392b 12px,#c0392b 24px)", borderRadius:"0 0 8px 8px" }}/>
      </div>
    </div>
  );
}
