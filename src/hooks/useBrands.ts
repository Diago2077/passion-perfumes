import { useEffect, useState } from "react";
import { supabase, type Database } from "@/lib/supabase";

type Brand = Database["public"]["Tables"]["brands"]["Row"];

export function useBrands(options?: { activeOnly?: boolean }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeOnly = options?.activeOnly ?? false;

  useEffect(() => {
    let cancelled = false;

    async function fetchBrands() {
      setLoading(true);
      setError(null);

      let query = supabase.from("brands").select("*").order("position", { ascending: true });
      if (activeOnly) query = query.eq("active", true);

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setBrands(data ?? []);
      }
      setLoading(false);
    }

    fetchBrands();
    return () => { cancelled = true; };
  }, [activeOnly]);

  async function deleteBrand(id: string) {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (!error) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    }
    return { error };
  }

  async function toggleActive(id: string, active: boolean) {
    const { error, data } = await supabase
      .from("brands")
      .update({ active })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setBrands((prev) => prev.map((b) => (b.id === id ? data : b)));
    }
    return { error };
  }

  async function refetch() {
    setLoading(true);
    let query = supabase.from("brands").select("*").order("position", { ascending: true });
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (!error) setBrands(data ?? []);
    setLoading(false);
  }

  return { brands, loading, error, deleteBrand, toggleActive, refetch };
}
