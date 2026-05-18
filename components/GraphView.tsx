"use client";
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  Node, Edge, Connection, Handle, Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect, useCallback } from "react";
import { Customer, upsertCustomer } from "@/lib/supabase";

const VIP_META: Record<string, { icon:string; color:string; label:string; size:number }> = {
  shogun:   { icon:"🏯", color:"#c0392b", label:"将軍", size:70 },
  daimyo:   { icon:"👑", color:"#c9a84c", label:"大名", size:60 },
  samurai:  { icon:"⚔️", color:"#1a3a5c", label:"武士", size:52 },
  merchant: { icon:"⚖️", color:"#8b7355", label:"商人", size:44 },
};
const STATUS_COLOR: Record<string, string> = {
  active:"#2d6a4f", sleeping:"#8b7355", blacklist:"#c0392b",
};

function CustomerNode({ data }: { data: Customer & { selected?: boolean } }) {
  const vip = VIP_META[data.vip] ?? VIP_META.merchant;
  const s = STATUS_COLOR[data.status] ?? "#8b7355";
  const isBlack = data.status === "blacklist";

  return (
    <div style={{ position:"relative", width:vip.size+40, paddingTop:8, textAlign:"center" }}>
      <Handle type="target" position={Position.Top} style={{ opacity:0, pointerEvents:"none" }}/>
      {data.selected && (
        <div style={{
          position:"absolute", top:8, left:"50%",
          width:vip.size+20, height:vip.size+20, borderRadius:"50%",
          border:`2px solid ${vip.color}`,
          animation:"pulse-gold 2s ease-in-out infinite",
          transform:"translateX(-50%)",
        }}/>
      )}
      <div style={{
        width:vip.size, height:vip.size, borderRadius:"50%",
        background: isBlack ? "radial-gradient(circle, #2a1a1a, #1a0f0a)" : "radial-gradient(circle, #f5e6c8, #e8d5a3)",
        border:`2.5px solid ${isBlack ? "#5a2222" : vip.color}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        margin:"0 auto", position:"relative",
        boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
        cursor:"pointer",
      }}>
        <div style={{ position:"absolute", inset:5, borderRadius:"50%", border:`1px dashed ${isBlack ? "#5a2222" : vip.color}`, opacity:0.5 }}/>
        <span style={{ fontSize:vip.size/3, filter:isBlack?"grayscale(1)":"none" }}>{vip.icon}</span>
        <div style={{ position:"absolute", top:3, right:3, width:10, height:10, borderRadius:"50%", background:s, border:"1.5px solid #1a0f0a" }}/>
      </div>
      <div style={{ marginTop:6, fontSize:11, fontWeight:"bold", color:"#f5e6c8", fontFamily:"serif", textShadow:"0 1px 4px rgba(0,0,0,0.8)" }}>
        {data.name.split(" ")[0]}
      </div>
      <div style={{ fontSize:9, color:vip.color, fontFamily:"serif", opacity:0.8 }}>{vip.label}</div>
      <div style={{ width:vip.size, margin:"4px auto 0", height:3, background:"rgba(255,255,255,0.1)", borderRadius:2 }}>
        <div style={{ width:`${data.trust}%`, height:"100%", borderRadius:2, background:`linear-gradient(90deg,${vip.color},#c9a84c)` }}/>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity:0, pointerEvents:"none" }}/>
    </div>
  );
}

const nodeTypes = { customer: CustomerNode };

interface Props {
  customers: Customer[];
  allCustomers: Customer[];
  selected: Customer | null;
  onSelect: (c: Customer) => void;
  onUpdate: (c: Customer) => void;
}

export default function GraphView({ customers, allCustomers, selected, onSelect, onUpdate }: Props) {
  const toNodes = (cs: Customer[]): Node[] =>
    cs.map(c => ({
      id: c.id, type: "customer",
      position: { x: c.pos_x, y: c.pos_y },
      data: { ...c, selected: selected?.id === c.id },
      draggable: true,
    }));

  const toEdges = (cs: Customer[]): Edge[] =>
    cs.filter(c => c.parent_id && cs.find(x => x.id === c.parent_id)).map(c => ({
      id: `e-${c.parent_id}-${c.id}`,
      source: c.parent_id!,
      target: c.id,
      style: { stroke:"#1a3a5c", strokeWidth:1.5, strokeDasharray:"6 4", opacity:0.5 },
    }));

  const [nodes, setNodes, onNodesChange] = useNodesState(toNodes(customers));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toEdges(customers));

  useEffect(() => {
    setNodes(toNodes(customers));
    setEdges(toEdges(customers));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, selected]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const c = allCustomers.find(x => x.id === node.id);
    if (c) onSelect(c);
  }, [allCustomers, onSelect]);

  const onNodeDragStop = useCallback(async (_: any, node: Node) => {
    const c = allCustomers.find(x => x.id === node.id);
    if (!c) return;
    const updated = { ...c, pos_x: node.position.x, pos_y: node.position.y };
    onUpdate(updated);
    await upsertCustomer({ id: c.id, pos_x: node.position.x, pos_y: node.position.y });
  }, [allCustomers, onUpdate]);

  const onConnect = useCallback((conn: Connection) => {
    setEdges(eds => addEdge(conn, eds));
  }, [setEdges]);

  return (
    <div style={{ width:"100%", height:"100%" }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onNodeClick={onNodeClick} onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes} fitView fitViewOptions={{ padding:0.3 }}
        minZoom={0.15} maxZoom={3} proOptions={{ hideAttribution: true }}
      >
        <Background color="#c9a84c" gap={60} size={0.4} />
        <Controls position="bottom-right" />
        <MiniMap position="bottom-left" nodeColor={(n) => VIP_META[n.data?.vip]?.color ?? "#8b7355"} maskColor="rgba(26,15,10,0.7)" />
      </ReactFlow>
      {customers.length === 0 && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          <div style={{ textAlign:"center", opacity:0.4 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⛩</div>
            <div style={{ color:"#c9a84c", fontSize:14, fontFamily:"serif" }}>まだ縁者がいません</div>
            <div style={{ color:"rgba(201,168,76,0.5)", fontSize:11, marginTop:4 }}>新規登録または Sheets から同期してください</div>
          </div>
        </div>
      )}
    </div>
  );
}
