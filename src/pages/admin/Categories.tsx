import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase, type Database } from "@/lib/supabase";
import { useCategories } from "@/hooks/useCategories";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY_FORM: CategoryInsert = {
  name: "",
  slug: "",
  image_url: "",
  position: 0,
  active: true,
};

export default function AdminCategories() {
  const { categories, loading, deleteCategory, toggleActive, refetch } = useCategories({ activeOnly: false });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, position: categories.length });
    setShowForm(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url ?? "",
      position: category.position,
      active: category.active,
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
      image_url: form.image_url || null,
      position: Number(form.position) || 0,
    };

    if (editing) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
      if (error) {
        toast.error("Error al guardar: " + error.message);
      } else {
        toast.success("Categoría actualizada");
        await refetch();
        closeForm();
      }
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) {
        toast.error("Error al crear: " + error.message);
      } else {
        toast.success("Categoría creada");
        await refetch();
        closeForm();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Los productos que la usan quedarán con esa categoría vacía.`)) return;
    const { error } = await deleteCategory(id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Categoría eliminada");
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categorías · usadas en el catálogo de productos y en "Explorá la colección"
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-auto py-8 px-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl">{editing ? "Editar categoría" : "Nueva categoría"}</h2>
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
                  placeholder="Ej: Perfumes Femeninos"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">Slug (identificador interno)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="femenino"
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Se usa para vincular productos a esta categoría. Sin espacios ni tildes.</p>
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
              <div className="space-y-1.5">
                <Label className="text-xs tracking-widest uppercase text-muted-foreground">URL de imagen</Label>
                <Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                <p className="text-[11px] text-muted-foreground">Se usa como fondo del mosaico en "Explorá la colección".</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear categoría"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay categorías. ¡Creá la primera!</p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden md:table-cell">Orden</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-9 h-9 object-cover rounded-sm border border-border shrink-0" />
                      ) : (
                        <div className="w-9 h-9 bg-muted rounded-sm shrink-0 flex items-center justify-center">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <p className="font-medium">{category.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                    {category.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {category.position}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={category.active ? "default" : "outline"} className="text-[10px]">
                      {category.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(category.id, !category.active)}
                        title={category.active ? "Desactivar" : "Activar"}
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {category.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(category)}
                        title="Editar"
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
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
    </div>
  );
}
