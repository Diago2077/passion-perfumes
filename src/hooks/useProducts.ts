import { useEffect, useState } from "react";
import { supabase, type Database } from "@/lib/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function useProducts(options?: { featuredOnly?: boolean; activeOnly?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featuredOnly = options?.featuredOnly ?? false;
  const activeOnly = options?.activeOnly ?? true;

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      let query = supabase.from("products").select("*").order("created_at", { ascending: false });

      if (activeOnly) query = query.eq("active", true);
      if (featuredOnly) query = query.eq("featured", true);

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, [featuredOnly, activeOnly]);

  async function deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    return { error };
  }

  async function toggleActive(id: string, active: boolean) {
    const { error, data } = await supabase
      .from("products")
      .update({ active })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    }
    return { error };
  }

  async function toggleFeatured(id: string, featured: boolean) {
    const { error, data } = await supabase
      .from("products")
      .update({ featured })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    }
    return { error };
  }

  async function refetch() {
    setLoading(true);
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (activeOnly) query = query.eq("active", true);
    if (featuredOnly) query = query.eq("featured", true);
    const { data, error } = await query;
    if (!error) setProducts(data ?? []);
    setLoading(false);
  }

  return { products, loading, error, deleteProduct, toggleActive, toggleFeatured, refetch };
}
