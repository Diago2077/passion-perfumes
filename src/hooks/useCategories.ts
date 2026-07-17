import { useEffect, useState } from "react";
import { supabase, type Database } from "@/lib/supabase";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function useCategories(options?: { activeOnly?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeOnly = options?.activeOnly ?? false;

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setLoading(true);
      setError(null);

      let query = supabase.from("categories").select("*").order("position", { ascending: true });
      if (activeOnly) query = query.eq("active", true);

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setCategories(data ?? []);
      }
      setLoading(false);
    }

    fetchCategories();
    return () => { cancelled = true; };
  }, [activeOnly]);

  async function deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    return { error };
  }

  async function toggleActive(id: string, active: boolean) {
    const { error, data } = await supabase
      .from("categories")
      .update({ active })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
    }
    return { error };
  }

  async function refetch() {
    setLoading(true);
    let query = supabase.from("categories").select("*").order("position", { ascending: true });
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (!error) setCategories(data ?? []);
    setLoading(false);
  }

  return { categories, loading, error, deleteCategory, toggleActive, refetch };
}
