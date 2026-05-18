"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { getCustomers, subscribeCustomers, Customer } from "@/lib/supabase";
import GraphView from "@/components/GraphView";
import ProfilePanel from "@/components/ProfilePanel";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AddCustomerModal from "@/components/AddCustomerModal";
import SheetsModal from "@/components/SheetsModal";

export default function Home() {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showSheets, setShowSheets] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      getCustomers().then(cs => { setCustomers(cs); setLoading(false); });
      const sub = subscribeCustomers(
        (c) => setCustomers(cs => [...cs, c]),
        (c) => setCustomers(cs => cs.map(x => x.id === c.id ? c : x)),
        (id) => setCustomers(cs => cs.filter(x => x.id !== id)),
      );
      return () => { sub.unsubscribe(); };
    } else {
      setLoading(false);
    }
  }, [status]);

  if (status === "unauthenticated" || (status === "loading" && !session)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #1a0f0a 0%, #2a1a0f 50%, #0f1a2a 100%)" }}>
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
          <defs>
            <pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60,0 L0,0 0,60" fill="none" stroke="#c9a84c" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
        <div className="relative text-center fade-up" style={{
          background: "linear-gradient(160deg, rgba(245,230,200,0.08), rgba(245,230,200,0.04))",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 12, padding: "48px 56px",
          backdropFilter: "blur(20px)",
          maxWidth: 400, width: "90%",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, borderRadius:"12px 12px 0 0",
            background:"repeating-linear-gradient(90deg,#c0392b 0,#c0392b 12px,#c9a84c 12px,#c9a84c 24px)" }}/>
          <div style={{ fontSize:56, marginBottom:16 }}>⛩</div>
          <h1 style={{ fontSize:28, fontWeight:"bold", color:"#c9a84c", letterSpacing:4, marginBottom:4 }}>客縁帳</h1>
          <p style={{ fontSize:11, color:"rgba(201,168,76,0.5)", letterSpacing:4, marginBottom:8 }}>KYAKUEN-CHO</p>
          <p style={{ fontSize:13, color:"rgba(245,230,200,0.6)", marginBottom:32, lineHeight:1.7 }}>
            浮世絵風 RPG 顧客管理システム<br/>
            <span style={{ fontSize:11 }}>Ukiyo-e RPG Customer Relationship World</span>
          </p>
          <button onClick={() => signIn("google")} style={{
            display:"flex", alignItems:"center", gap:12, justifyContent:"center",
            width:"100%", padding:"14px 24px",
            background:"linear-gradient(135deg,#c0392b,#9b2335)",
            border:"none", borderRadius:6, cursor:"pointer",
            color:"white", fontSize:14, fontFamily:"serif",
            boxShadow:"0 4px 20px rgba(192,57,43,0.4)",
          }}>
            Google で入国する
          </button>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, borderRadius:"0 0 12px 12px",
            background:"repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 12px,#c0392b 12px,#c0392b 24px)" }}/>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? customers :
    filter === "sleeping"   ? customers.filter(c => c.status === "sleeping") :
    filter === "blacklist"  ? customers.filter(c => c.status === "blacklist") :
    customers.filter(c => c.vip === filter);

  return (
    <div className="fixed inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg,#1a0f0a 0%,#2a1a0f 50%,#0f1a2a 100%)" }}>
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60,0 L0,0 0,60" fill="none" stroke="#c9a84c" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      <TopBar filter={filter} onFilterChange={setFilter} onAdd={() => setShowAdd(true)}
        onSheetsOpen={() => setShowSheets(true)} customers={customers} session={session} />
      <div className="absolute left-0 right-0" style={{ top:56, bottom:0, display:"flex" }}>
        <Sidebar customers={customers} />
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div style={{ fontSize:48, marginBottom:16 }} className="spin-slow">⛩</div>
                <p style={{ color:"rgba(201,168,76,0.6)", fontSize:13, fontFamily:"serif" }}>王国を読み込み中…</p>
              </div>
            </div>
          ) : (
            <GraphView customers={filtered} allCustomers={customers} selected={selected}
              onSelect={setSelected} onUpdate={(updated) => setCustomers(cs => cs.map(c => c.id === updated.id ? updated : c))} />
          )}
        </div>
        {selected && (
          <ProfilePanel customer={selected} onClose={() => setSelected(null)}
            onUpdate={(updated) => { setCustomers(cs => cs.map(c => c.id === updated.id ? updated : c)); setSelected(updated); }} />
        )}
      </div>
      {showAdd && <AddCustomerModal customers={customers} onClose={() => setShowAdd(false)}
        onAdd={(c) => setCustomers(cs => [...cs, c])} />}
      {showSheets && <SheetsModal onClose={() => setShowSheets(false)}
        onSync={(newCs) => setCustomers(newCs)} session={session} />}
    </div>
  );
}
