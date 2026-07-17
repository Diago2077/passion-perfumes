import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, formatPrice, type DisplayProduct } from "@/lib/format";
import { fallbackProducts } from "@/lib/fallbackData";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { ProductCard } from "@/components/site/ProductCard";

const PAGE_SIZE = 12;

type CategoryChip = { slug: string; name: string };

export default function Catalog() {
  const [products, setProducts] = useState<DisplayProduct[]>(fallbackProducts);
  const [categoryChips, setCategoryChips] = useState<CategoryChip[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      let categoryNameBySlug: Record<string, string> = { ...CATEGORY_LABELS };
      let chips: CategoryChip[] = Object.entries(CATEGORY_LABELS).map(([slug, name]) => ({ slug, name }));

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("active", true)
          .order("position", { ascending: true });

        if (!error && data && data.length > 0) {
          categoryNameBySlug = {};
          data.forEach((c) => { categoryNameBySlug[c.slug] = c.name; });
          chips = data.map((c) => ({ slug: c.slug, name: c.name }));
        }
      } catch {
        // fall back to default category labels
      }
      setCategoryChips(chips);

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          setLoading(false);
          return;
        }

        const mapped: DisplayProduct[] = data.map((p) => ({
          id: p.id,
          code: p.code ?? null,
          name: p.name,
          category: categoryNameBySlug[p.category ?? ""] ?? p.category ?? "",
          categorySlug: p.category,
          desc: p.description ?? "",
          price: formatPrice(p.price),
          img: p.image_url ?? "",
        }));

        setProducts(mapped);
      } catch {
        // silently fall back to hardcoded products
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = products;

    if (activeCategory) {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }
    if (q) {
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, search, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <WhatsAppFloat />
      <Navbar />

      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">✦ Catálogo completo</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Todos nuestros productos</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Explorá el catálogo entero y consultá por el que más te guste.</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-9"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`text-xs tracking-widest uppercase px-4 py-2 rounded-sm border transition-colors ${
              activeCategory === ""
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            Todas
          </button>
          {categoryChips.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActiveCategory(c.slug)}
              className={`text-xs tracking-widest uppercase px-4 py-2 rounded-sm border transition-colors ${
                activeCategory === c.slug
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted/40 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <PackageSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {search
                ? `Ningún producto coincide con "${search}".`
                : "No hay productos en esta categoría por ahora."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-xs text-muted-foreground mb-8">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((p, i) => (
                <ProductCard key={p.id ?? p.name} p={p} delay={i * 0.05} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-xs tracking-widest uppercase px-4 py-2 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Anterior
                </button>
                <span className="text-xs text-muted-foreground px-2">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-xs tracking-widest uppercase px-4 py-2 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
