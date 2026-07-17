import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, MessageSquare, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalContacts: number;
  unreadContacts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: featuredProducts },
        { count: totalContacts },
        { count: unreadContacts },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("featured", true),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
      ]);

      setStats({
        totalProducts: totalProducts ?? 0,
        activeProducts: activeProducts ?? 0,
        featuredProducts: featuredProducts ?? 0,
        totalContacts: totalContacts ?? 0,
        unreadContacts: unreadContacts ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          title: "Productos totales",
          value: stats.totalProducts,
          sub: `${stats.activeProducts} activos`,
          icon: Package,
          href: "/admin/products",
        },
        {
          title: "Destacados",
          value: stats.featuredProducts,
          sub: "Aparecen en la landing",
          icon: Star,
          href: "/admin/products",
        },
        {
          title: "Mensajes",
          value: stats.totalContacts,
          sub: `${stats.unreadContacts} sin leer`,
          icon: MessageSquare,
          href: "/admin/contacts",
          alert: stats.unreadContacts > 0,
        },
        {
          title: "Visibilidad",
          value: stats.activeProducts,
          sub: "Productos visibles",
          icon: Eye,
          href: "/admin/products",
        },
      ]
    : [];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen de Passion Perfumes y Cosméticos</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/40 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link key={card.title} to={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className={`w-4 h-4 ${card.alert ? "text-destructive" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                  <p className="font-serif text-3xl mb-1">{card.value}</p>
                  <p className={`text-xs ${card.alert ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {card.sub}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/products"
          className="flex items-center gap-4 p-5 border border-border rounded-sm hover:bg-muted/40 transition-colors"
        >
          <div className="w-10 h-10 border border-border rounded-sm flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">Gestionar productos</p>
            <p className="text-xs text-muted-foreground">Agregar, editar o desactivar productos del catálogo</p>
          </div>
        </Link>
        <Link
          to="/admin/contacts"
          className="flex items-center gap-4 p-5 border border-border rounded-sm hover:bg-muted/40 transition-colors"
        >
          <div className="w-10 h-10 border border-border rounded-sm flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">Ver mensajes</p>
            <p className="text-xs text-muted-foreground">Consultas recibidas desde el formulario de contacto</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
