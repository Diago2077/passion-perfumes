import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Award, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase, type Database } from "@/lib/supabase";
import { useBrands } from "@/hooks/useBrands";

type Brand = Database["public"]["Tables"]["brands"]["Row"];
type BrandInsert = Database["public"]["Tables"]["brands"]["Insert"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PAGE_SIZE = 10;

const EMPTY_FORM: BrandInsert = {
  name: "",
  slug: "",
  position: 0,
  active: true,
};

export default function AdminBrands() {
  const { brands, loading, deleteBrand, toggleActive, refetch } = useBrands({ activeOnly: false });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = brands;

    if (statusFilter !== "all") {
      result = result.filter((b) => (statusFilter === "active" ? b.active : !b.active));
    }
    if (q) {
      result = result.filter(
        (b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)
      );
    }

    return result;
  }, [brands, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const paginatedBrands = filteredBrands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, position: brands.length });
    setShowForm(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      position: brand.position,
      active: brand.active,
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
      slug: form.slug || slugify(form.name),
      position: Number(form.position) || 0,
    };

    if (editing) {
      const { error } = await supabase.from("brands").update(payload).eq("id", editing.id);
      if (error) {
        toast.error("Error al guardar: " + error.message);
      } else {
        toast.success("Marca actualizada");
        await refetch();
        closeForm();
      }
    } else {
      const { error } = await supabase.from("brands").insert(payload);
      if (error) {
        toast.error("Error al crear: " + error.message);
      } else {
        toast.success("Marca creada");
        await refetch();
        closeForm();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Los productos que la usan quedarán sin marca asignada.`)) return;
    const { error } = await deleteBrand(id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Marca eliminada");
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl mb-1">Marcas</h1>
          <p className="text-sm text-muted-foreground">
            {search || statusFilter !== "all"
              ? `${filteredBrands.length} de ${brands.length} marcas`
              : `${brands.length} marcas · usadas en el catálogo de productos y en "Las mejores marcas"`}
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
            placeholder="Buscar por nombre o slug..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5 border border-border rounded-sm p-1">
          {(["all", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setStatusFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-sm transition-colors ${
                statusFilter === v
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "all" ? "Todas" : v === "active" ? "Activas" : "Inactivas"}
            </button>
          ))}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-auto py-8 px-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl">{editing ? "Editar marca" : "Nueva marca"}</h2>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: editing ? f.slug : slugify(name) }));
                  }}
                  required
                  placeholder="Ej: Dior"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Slug (identificador interno)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="dior"
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Se usa para vincular productos a esta marca. Sin espacios ni tildes.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Orden</Label>
                  <Input
                    type="number"
                    value={form.position ?? 0}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                    Activa (visible en la tienda)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear marca"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brands table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay marcas. ¡Creá la primera!</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {search ? `Ninguna marca coincide con "${search}".` : "Ninguna marca coincide con el filtro."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Marca</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden md:table-cell">Orden</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-muted rounded-sm shrink-0 flex items-center justify-center">
                        <Award className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="font-medium">{brand.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                    {brand.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {brand.position}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={brand.active ? "default" : "outline"} className="text-[10px]">
                      {brand.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(brand.id, !brand.active)}
                        title={brand.active ? "Desactivar" : "Activar"}
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {brand.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(brand)}
                        title="Editar"
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id, brand.name)}
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

      {!loading && filteredBrands.length > PAGE_SIZE && (
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
