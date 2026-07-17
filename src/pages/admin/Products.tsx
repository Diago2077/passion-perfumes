import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, Package, Search,
  ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase, type Database } from "@/lib/supabase";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "name-asc", label: "Nombre (A-Z)" },
  { value: "name-desc", label: "Nombre (Z-A)" },
  { value: "price-asc", label: "Precio (menor a mayor)" },
  { value: "price-desc", label: "Precio (mayor a menor)" },
] as const;
type SortBy = (typeof SORT_OPTIONS)[number]["value"];

const EMPTY_FORM: ProductInsert = {
  code: "",
  name: "",
  description: "",
  price: null,
  category: "",
  brand: "",
  image_url: "",
  featured: false,
  active: true,
};

export default function AdminProducts() {
  const { products, loading, deleteProduct, toggleActive, toggleFeatured, refetch } = useProducts({
    activeOnly: false,
    featuredOnly: false,
  });
  const { categories } = useCategories({ activeOnly: false });
  const { brands } = useBrands({ activeOnly: false });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not-featured">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFilterCount =
    (categoryFilter ? 1 : 0) +
    (brandFilter ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (featuredFilter !== "all" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  function clearFilters() {
    setCategoryFilter("");
    setBrandFilter("");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = products;

    if (q) {
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (brandFilter) {
      result = result.filter((p) => p.brand === brandFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => (statusFilter === "active" ? p.active : !p.active));
    }
    if (featuredFilter !== "all") {
      result = result.filter((p) => (featuredFilter === "featured" ? p.featured : !p.featured));
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((p) => new Date(p.created_at).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1; // end of day
      result = result.filter((p) => new Date(p.created_at).getTime() <= to);
    }

    result = [...result];
    switch (sortBy) {
      case "oldest":
        result.reverse();
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      // "newest" is the hook's default order (created_at desc); no re-sort needed
    }

    return result;
  }, [products, search, categoryFilter, brandFilter, statusFilter, featuredFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, brandFilter, statusFilter, featuredFilter, dateFrom, dateTo, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      code: product.code ?? "",
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      category: product.category ?? "",
      brand: product.brand ?? "",
      image_url: product.image_url ?? "",
      featured: product.featured,
      active: product.active,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      price: form.price ? Number(form.price) : null,
      description: form.description || null,
      brand: form.brand || null,
      image_url: form.image_url || null,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) {
        toast.error("Error al guardar: " + error.message);
      } else {
        toast.success("Producto actualizado");
        await refetch();
        closeForm();
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        toast.error("Error al crear: " + error.message);
      } else {
        toast.success("Producto creado");
        await refetch();
        closeForm();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await deleteProduct(id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Producto eliminado");
    }
  }

  function categoryLabel(cat: string | null) {
    return categories.find((c) => c.slug === cat)?.name ?? cat ?? "—";
  }

  function brandLabel(brand: string | null) {
    return brands.find((b) => b.slug === brand)?.name ?? brand ?? "—";
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl mb-1">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {search || activeFilterCount > 0
              ? `${filteredProducts.length} de ${products.length} productos`
              : `${products.length} productos en total`}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative max-w-sm w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-9"
          />
        </div>

        {/* Filters dropdown */}
        <div className="relative" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setFilterOpen((v) => !v); setSortOpen(false); }}
            className="gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {filterOpen && (
            <div className="absolute z-40 top-full mt-2 left-0 w-64 bg-card border border-border rounded-sm shadow-lg p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Categoría</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Todas</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Marca</Label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Todas</option>
                  {brands.map((b) => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Estado</Label>
                <div className="flex gap-1.5">
                  {(["all", "active", "inactive"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStatusFilter(v)}
                      className={`flex-1 text-xs py-1.5 rounded-sm border transition-colors ${
                        statusFilter === v
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {v === "all" ? "Todos" : v === "active" ? "Activos" : "Inactivos"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Destacado</Label>
                <div className="flex gap-1.5">
                  {(["all", "featured", "not-featured"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFeaturedFilter(v)}
                      className={`flex-1 text-xs py-1.5 rounded-sm border transition-colors ${
                        featuredFilter === v
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {v === "all" ? "Todos" : v === "featured" ? "Sí" : "No"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Fecha de creación</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                    className="text-xs"
                    aria-label="Desde"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                    className="text-xs"
                    aria-label="Hasta"
                  />
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative" ref={sortRef}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setSortOpen((v) => !v); setFilterOpen(false); }}
            className="gap-2"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar
          </Button>
          {sortOpen && (
            <div className="absolute z-40 top-full mt-2 left-0 w-56 bg-card border border-border rounded-sm shadow-lg py-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                  className="flex items-center justify-between w-full px-3.5 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
                >
                  {opt.label}
                  {sortBy === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-auto py-8 px-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Código</Label>
                  <Input value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ej: PP-001" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Nombre *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nombre del producto" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Descripción</Label>
                <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve" rows={3} className="resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Precio (₲)</Label>
                  <Input type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })} placeholder="8500" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground">Categoría</Label>
                    <Link to="/admin/products/categories" className="text-[11px] text-muted-foreground hover:text-foreground underline">
                      Gestionar
                    </Link>
                  </div>
                  <select
                    value={form.category ?? ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="" disabled>Elegí una categoría</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Marca</Label>
                  <Link to="/admin/products/brands" className="text-[11px] text-muted-foreground hover:text-foreground underline">
                    Gestionar
                  </Link>
                </div>
                <select
                  value={form.brand ?? ""}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Sin marca</option>
                  {brands.map((b) => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">URL de imagen</Label>
                <Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  Activo (visible en la tienda)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                  Destacado
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay productos. ¡Creá el primero!</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {search ? `Ningún producto coincide con "${search}".` : "Ningún producto coincide con los filtros aplicados."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden lg:table-cell">Código</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden lg:table-cell">Marca</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden sm:table-cell">Precio</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden lg:table-cell">Creado</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-9 h-9 object-cover rounded-sm border border-border shrink-0" />
                      ) : (
                        <div className="w-9 h-9 bg-muted rounded-sm shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.featured && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden lg:table-cell">
                    {product.code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {categoryLabel(product.category)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {brandLabel(product.brand)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {product.price ? `₲ ${product.price.toLocaleString("es-PY")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.active ? "default" : "outline"} className="text-[10px]">
                      {product.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleFeatured(product.id, !product.featured)}
                        title={product.featured ? "Quitar de destacados" : "Marcar como destacado"}
                        className={`p-1.5 rounded-sm transition-colors ${product.featured ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(product.id, !product.active)}
                        title={product.active ? "Desactivar" : "Activar"}
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {product.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(product)}
                        title="Editar"
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Eliminar"
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredProducts.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
