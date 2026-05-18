import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Customer {
  id: string;
  name: string;
  nickname?: string;
  vip: "merchant" | "samurai" | "daimyo" | "shogun";
  status: "active" | "sleeping" | "blacklist";
  trust: number;
  phone?: string;
  telegram?: string;
  instagram?: string;
  location?: string;
  tags: string[];
  notes?: string;
  purchases: number;
  referrals: number;
  last_contact?: string;
  parent_id?: string | null;
  pos_x: number;
  pos_y: number;
  sheets_row?: number;
  created_at: string;
  updated_at: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertCustomer(c: Partial<Customer>) {
  const { data, error } = await supabase
    .from("customers")
    .upsert(c, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export function subscribeCustomers(
  onInsert: (c: Customer) => void,
  onUpdate: (c: Customer) => void,
  onDelete: (id: string) => void
) {
  return supabase
    .channel("customers-realtime")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "customers" },
      (p) => onInsert(p.new as Customer))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customers" },
      (p) => onUpdate(p.new as Customer))
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "customers" },
      (p) => onDelete(p.old.id))
    .subscribe();
}

export async function runAutomation() {
  const customers = await getCustomers();
  const now = new Date();
  const updates: Partial<Customer>[] = [];

  for (const c of customers) {
    const daysSinceContact = c.last_contact
      ? Math.floor((now.getTime() - new Date(c.last_contact).getTime()) / 86400000)
      : 999;

    const changes: Partial<Customer> = { id: c.id };
    let changed = false;

    if (daysSinceContact > 60 && c.status === "active") {
      changes.status = "sleeping"; changed = true;
    }
    if (c.purchases >= 20 && c.vip === "samurai") {
      changes.vip = "daimyo"; changed = true;
    }
    if (c.purchases >= 35 && c.vip === "daimyo") {
      changes.vip = "shogun"; changed = true;
    }
    if (c.referrals >= 5 && c.trust < 90) {
      changes.trust = Math.min(100, c.trust + 10); changed = true;
    }

    if (changed) updates.push(changes);
  }

  for (const u of updates) {
    await upsertCustomer(u);
  }

  return updates.length;
}
