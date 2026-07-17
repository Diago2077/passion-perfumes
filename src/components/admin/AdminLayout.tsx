import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Tag, Award, MessageSquare, LogOut, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    to: "/admin/products",
    label: "Productos",
    icon: Package,
    end: true,
    children: [
      { to: "/admin/products/categories", label: "Categorías", icon: Tag },
      { to: "/admin/products/brands", label: "Marcas", icon: Award },
    ],
  },
  { to: "/admin/contacts", label: "Mensajes", icon: MessageSquare, end: false },
];

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [productsOpen, setProductsOpen] = useState(location.pathname.startsWith("/admin/products"));

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm tracking-widest uppercase animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium tracking-wide">Panel Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end, children }) =>
            children ? (
              <div key={to}>
                <div
                  className={`flex items-center rounded-sm text-sm transition-colors ${
                    location.pathname.startsWith(to)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <NavLink to={to} end={end} className="flex items-center gap-3 flex-1 px-3 py-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </NavLink>
                  <button
                    onClick={() => setProductsOpen((v) => !v)}
                    aria-label={productsOpen ? "Contraer" : "Expandir"}
                    className="px-2 py-2"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {productsOpen && (
                  <div className="mt-1 space-y-1">
                    {children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 py-2 ml-4 pl-3 pr-3 border-l border-sidebar-border text-sm rounded-sm transition-colors ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                          }`
                        }
                      >
                        <child.icon className="w-4 h-4 shrink-0" />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate("/admin/login");
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-sm text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
