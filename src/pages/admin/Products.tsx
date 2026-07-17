import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase, type Database } from "@/lib/supabase";
import { useProducts } from "@/hooks/useProducts";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

const CATEGORIES = [
  { value: "femenino", label: "Perfume Femenino" },
  { value: "masculino", label: "Perfume Masculino" },
  { value: "arabe", label: "Perfume Árabe" },
  { value: "cosmetico", label: "Cosméticos" },
  { value: "oferta", label: "Oferta" },
  { value: "novedad", label: "Novedad" },
];

const EMPTY_FORM: ProductInsert = {
  code: "",
  name: "",
  description: "",
  price: null,
  category: "femenino",
  image_url: "",
  featured: false,
  active: true,
};

export default function AdminProducts() {
  const { products, loading, deleteProduct, toggleActive, toggleFeatured, refetch } = useProducts({
    activeOnly: false,
    featuredOnly: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
      category: product.category ?? "femenino",
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
    return CATEGORIES.find((c) => c.value === cat)?.label ?? cat ?? "—";
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">Productos</h1>
          <p className="text-sm text-muted-foreground">{products.length} productos en total</p>
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
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Precio (Gs.)</Label>
                  <Input type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })} placeholder="8500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">Categoría</Label>
                  <select
                    value={form.category ?? "femenino"}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
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
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden lg:table-cell">Código</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden sm:table-cell">Precio</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
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
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {product.price ? `$${product.price.toLocaleString("es-PY")}` : "—"}
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
    </div>
  );
}
