import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Mail,
  Star,
  ChevronDown,
  Menu,
  X,
  MessageCircle,
  Sparkles,
  Heart,
  Shield,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const WHATSAPP_LINK = "https://wa.link/v63z31";

function whatsappLink(msg: string) {
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
}

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Promociones", href: "#promociones" },
  { label: "Marcas", href: "#marcas" },
  { label: "Ubicación", href: "#ubicacion" },
  { label: "Contacto", href: "#contacto" },
];

const categories = [
  {
    title: "Perfumes Femeninos",
    subtitle: "Florales, dulces y orientales",
    img: "https://images.unsplash.com/photo-1595425959632-34f2822322ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    msg: "Hola! Quisiera consultar sobre los perfumes femeninos disponibles.",
  },
  {
    title: "Perfumes Masculinos",
    subtitle: "Amaderados, frescos e intensos",
    img: "https://images.unsplash.com/photo-1598634222670-87c5f558119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    msg: "Hola! Quisiera consultar sobre los perfumes masculinos disponibles.",
  },
  {
    title: "Perfumes Árabes",
    subtitle: "Oud, ambas y especias exóticas",
    img: "https://images.unsplash.com/photo-1611146264101-358a3b387eee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    msg: "Hola! Quisiera consultar sobre los perfumes árabes disponibles.",
  },
  {
    title: "Cosméticos",
    subtitle: "Maquillaje y cuidado personal",
    img: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    msg: "Hola! Quisiera consultar sobre los cosméticos disponibles.",
  },
  {
    title: "Ofertas",
    subtitle: "Descuentos y combos especiales",
    img: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    msg: "Hola! Quisiera consultar las ofertas disponibles.",
  },
  {
    title: "Novedades",
    subtitle: "Últimos lanzamientos",
    img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    msg: "Hola! Quisiera consultar las novedades disponibles.",
  },
];

type DisplayProduct = {
  name: string;
  category: string;
  desc: string;
  price: string;
  img: string;
};

const fallbackProducts: DisplayProduct[] = [
  {
    name: "Rose Élixir",
    category: "Perfume Femenino",
    desc: "Fragancia floral con notas de rosa damascena, jazmín y sándalo blanco.",
    price: "$8.500",
    img: "https://images.unsplash.com/photo-1595425959632-34f2822322ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Oud Noir",
    category: "Perfume Árabe",
    desc: "Fragancia oriental intensa con oud, ámbar y especias exóticas.",
    price: "$12.900",
    img: "https://images.unsplash.com/photo-1611146264101-358a3b387eee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Gentleman Élite",
    category: "Perfume Masculino",
    desc: "Fragancia amaderada con notas de vetiver, cuero y cedro.",
    price: "$9.200",
    img: "https://images.unsplash.com/photo-1598634222670-87c5f558119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Gold Velvet",
    category: "Perfume Femenino",
    desc: "Seductor y envolvente, con notas de vainilla, musgo y pétalos de rosa.",
    price: "$10.400",
    img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Velvet Rouge",
    category: "Cosméticos",
    desc: "Labial de larga duración con acabado satinado en tonos rojos y nude.",
    price: "$3.800",
    img: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    name: "Aqua Fresca",
    category: "Perfume Masculino",
    desc: "Fresco y dinámico, con notas cítricas, menta y madera de roble.",
    price: "$7.600",
    img: "https://images.unsplash.com/photo-1553699357-fdefb876c402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  femenino: "Perfume Femenino",
  masculino: "Perfume Masculino",
  arabe: "Perfume Árabe",
  cosmetico: "Cosméticos",
  oferta: "Oferta",
  novedad: "Novedad",
};

function formatPrice(price: number | null): string {
  if (price == null) return "";
  return `$${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

const benefits = [
  { icon: Heart, title: "Atención personalizada", desc: "Te ayudamos a encontrar la fragancia perfecta para vos." },
  { icon: Star, title: "Productos seleccionados", desc: "Solo trabajamos con marcas y fragancias de calidad garantizada." },
  { icon: Sparkles, title: "Promociones actualizadas", desc: "Ofertas exclusivas, combos y descuentos que se renuevan regularmente." },
  { icon: MessageCircle, title: "Consultas por WhatsApp", desc: "Respondemos rápido para que no pierdas tiempo esperando." },
  { icon: Shield, title: "Compra confiable", desc: "Productos originales con garantía y atención postventa." },
  { icon: Clock, title: "Fragancias para cada ocasión", desc: "Para el trabajo, una noche especial, el día a día o un regalo." },
];

const brands = [
  "Dior", "Chanel", "YSL", "Lancôme", "Versace", "Carolina Herrera",
  "Hugo Boss", "Armani", "Burberry", "Montale", "Al Haramain", "Swiss Arabian",
];

const promos = [
  {
    badge: "OFERTA ESPECIAL",
    title: "2x1 en Perfumes Femeninos",
    desc: "Llevás dos fragancias al precio de una. Por tiempo limitado.",
    img: "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=700&q=80",
    msg: "Hola! Quisiera aprovechar la promo 2x1 en perfumes femeninos.",
  },
  {
    badge: "COMBO REGALO",
    title: "Kit Perfume + Cosmético",
    desc: "El regalo ideal: perfume + labial o crema a precio especial.",
    img: "https://images.unsplash.com/photo-1780838039819-c2b226cf0941?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=700&q=80",
    msg: "Hola! Quisiera consultar el combo perfume + cosmético.",
  },
  {
    badge: "NOVEDAD",
    title: "Colección de Perfumes Árabes",
    desc: "Nueva colección de ouds y perfumes orientales. Aromas únicos y exclusivos.",
    img: "https://images.unsplash.com/photo-1611146264101-358a3b387eee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=700&q=80",
    msg: "Hola! Quisiera conocer la nueva colección de perfumes árabes.",
  },
];

function WhatsAppFloat() {
  return (
    <motion.a
      href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="text-sm font-medium hidden sm:inline">Consultar por WhatsApp</span>
    </motion.a>
  );
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>(fallbackProducts);

  // Fetch featured products from Supabase; fall back to hardcoded if empty or error
  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .eq("active", true)
          .limit(6);

        if (error || !data || data.length === 0) return;

        const mapped: DisplayProduct[] = data.map((p) => ({
          name: p.name,
          category: CATEGORY_LABELS[p.category ?? ""] ?? p.category ?? "",
          desc: p.description ?? "",
          price: formatPrice(p.price),
          img: p.image_url ?? "",
        }));

        setDisplayProducts(mapped);
      } catch {
        // silently fall back to hardcoded data
      }
    }
    loadFeaturedProducts();
  }, []);

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    const msg = `Hola! Soy ${contactForm.name}. ${contactForm.message} (Tel: ${contactForm.phone})`;

    // Insert into Supabase (fire and forget — don't block the WhatsApp redirect)
    supabase.from("contact_messages").insert({
      name: contactForm.name,
      phone: contactForm.phone || null,
      message: contactForm.message,
    }).then(({ error }) => {
      if (error) console.warn("Could not save contact message:", error.message);
    });

    window.open(whatsappLink(msg), "_blank");
    toast.success("Redirigiendo a WhatsApp...");
    setContactForm({ name: "", phone: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <WhatsAppFloat />

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="#inicio" className="flex items-center">
            <img
              src="https://hercules-cdn.com/file_C16P4Sgny9lWcaa1ibK4GgJr"
              alt="Passion Perfumes y Cosméticos"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </a>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-foreground text-background text-xs tracking-wider uppercase px-4 py-2 rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <button className="lg:hidden p-2 text-foreground cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-background border-t border-border overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="text-sm tracking-widest uppercase text-muted-foreground" onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </a>
                ))}
                <a
                  href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-foreground text-background text-xs tracking-wider uppercase px-4 py-2.5 rounded-sm w-fit cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar por WhatsApp
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621275155732-2bff82c64fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 pt-40">
          <motion.div className="max-w-xl" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: "easeOut" }}>
            <motion.p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              ✦ Perfumería Premium
            </motion.p>
            <motion.h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-tight text-balance mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
              Descubrí aromas que hablan por vos
            </motion.h1>
            <motion.p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              Perfumes, cosméticos y productos de belleza seleccionados para cada estilo, ocasión y personalidad.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <a href="#catalogo" className="inline-flex items-center justify-center gap-2 bg-foreground text-background text-xs tracking-wider uppercase px-7 py-3.5 rounded-sm hover:opacity-80 transition-opacity cursor-pointer">
                Ver catálogo
              </a>
              <a
                href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-foreground text-foreground text-xs tracking-wider uppercase px-7 py-3.5 rounded-sm hover:bg-foreground hover:text-background transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          <span className="text-[10px] tracking-widest uppercase">Explorar</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section id="catalogo" className="py-20 sm:py-28 max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">✦ Nuestras categorías</p>
          <h2 className="font-serif text-4xl sm:text-5xl">Explorá la colección</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.title}
              href={whatsappLink(cat.msg)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-sm aspect-[4/5] cursor-pointer block"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
                <p className="font-serif text-base sm:text-xl leading-tight mb-1">{cat.title}</p>
                <p className="text-[10px] sm:text-xs tracking-wider opacity-80 mb-3">{cat.subtitle}</p>
                <span className="text-[10px] tracking-widest uppercase border border-white/50 px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Consultar
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 sm:py-28 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">✦ Selección premium</p>
            <h2 className="font-serif text-4xl sm:text-5xl">Productos destacados</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((p, i) => (
              <motion.div
                key={p.name}
                className="bg-card border border-border rounded-sm overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-sm">
                    {p.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl mb-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.desc}</p>
                  {p.price && <p className="text-sm font-medium mb-4">{p.price}</p>}
                  <a
                    href={whatsappLink(`Hola! Quisiera consultar por el producto: ${p.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-foreground text-background text-xs tracking-wider uppercase py-2.5 rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Consultar
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      <section id="promociones" className="py-20 sm:py-28 max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">✦ Por tiempo limitado</p>
          <h2 className="font-serif text-4xl sm:text-5xl mb-3">Promociones especiales</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Conocé nuestras ofertas disponibles por tiempo limitado.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.title}
              className="relative overflow-hidden rounded-sm group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={promo.img} alt={promo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-[10px] tracking-widest uppercase px-3 py-1 rounded-sm w-fit">
                  {promo.badge}
                </span>
                <div>
                  <h3 className="font-serif text-xl mb-1">{promo.title}</h3>
                  <p className="text-xs opacity-80 mb-4 leading-relaxed">{promo.desc}</p>
                  <a
                    href={whatsappLink(promo.msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-sm hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Aprovechar oferta
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 sm:py-28 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-3">✦ ¿Por qué elegirnos?</p>
            <h2 className="font-serif text-4xl sm:text-5xl">Tu experiencia, nuestra prioridad</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div key={b.title} className="flex gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="shrink-0 w-10 h-10 border border-background/30 rounded-sm flex items-center justify-center">
                  <b.icon className="w-4 h-4 opacity-70" />
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">{b.title}</h3>
                  <p className="text-xs opacity-60 leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section id="marcas" className="py-20 sm:py-24 max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">✦ Marcas disponibles</p>
          <h2 className="font-serif text-4xl sm:text-5xl">Las mejores marcas</h2>
        </motion.div>
        <motion.div className="flex flex-wrap justify-center gap-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          {brands.map((brand) => (
            <span key={brand} className="border border-border text-xs tracking-widest uppercase px-5 py-2.5 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-default">
              {brand}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ABOUT */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-sm">
                <img src="https://images.unsplash.com/photo-1758225502621-9102d2856dc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" alt="Passion Perfumes" className="w-full h-full object-cover" />
              </div>
              <motion.div
                className="absolute -bottom-6 -right-4 bg-card border border-border p-5 shadow-xl max-w-[200px]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-serif text-3xl mb-1">+500</p>
                <p className="text-xs text-muted-foreground tracking-wider">Fragancias disponibles</p>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">✦ Nuestra perfumería</p>
              <h2 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight">Una experiencia de belleza única</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                En Passion Perfumes y Cosméticos ofrecemos una selección de fragancias, cosméticos y productos de belleza pensados para realzar tu estilo personal. Nuestro objetivo es ayudarte a encontrar el aroma ideal para cada momento.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Trabajamos con las mejores marcas nacionales e internacionales, desde clásicos atemporales hasta las últimas tendencias en perfumería árabe y nicho. Cada producto es cuidadosamente seleccionado para ofrecerte lo mejor.
              </p>
              <a
                href={whatsappLink("Hola! Quisiera saber más sobre Passion Perfumes y Cosméticos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-foreground text-background text-xs tracking-wider uppercase px-7 py-3.5 rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Hablamos por WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="ubicacion" className="py-20 sm:py-28 max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">✦ Encontranos</p>
          <h2 className="font-serif text-4xl sm:text-5xl mb-3">Visitá nuestra tienda</h2>
          <p className="text-muted-foreground max-w-md mx-auto">También podés consultar nuestros productos directamente por WhatsApp.</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex gap-4 p-5 bg-card border border-border rounded-sm">
              <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm mb-1">Dirección</p>
                <p className="text-muted-foreground text-sm">Av. Abay — Microcentro, Ciudad del Este, Paraguay</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 bg-card border border-border rounded-sm">
              <Clock className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm mb-2">Horario de atención</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>Lunes a Viernes: 6:30 - 15:30</p>
                  <p>Sábados: 6:30 - 12:00</p>
                  <p>Domingos: Cerrado</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 p-5 bg-card border border-border rounded-sm">
              <MessageCircle className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm mb-1">Teléfono / WhatsApp</p>
                <a
                  href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  0983 333 313
                </a>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="relative rounded-sm overflow-hidden border border-border aspect-video"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <iframe
              src="https://maps.google.com/maps?q=Av+Abay+Microcentro+Ciudad+del+Este+Paraguay&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Passion Perfumes"
              className="w-full h-full"
            />
            <div className="absolute bottom-3 left-3">
              <a
                href="https://maps.app.goo.gl/K9mgEjqc24p2Xq4R7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm text-foreground text-xs tracking-wider uppercase px-3 py-2 rounded-sm shadow hover:bg-background transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Ver en Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="py-20 sm:py-28 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-4">✦ Estamos para vos</p>
              <h2 className="font-serif text-4xl sm:text-5xl mb-6">Hablemos</h2>
              <p className="opacity-60 leading-relaxed mb-8">Escribinos por WhatsApp, seguinos en redes o dejanos tus datos y te contactamos a la brevedad.</p>
              <div className="flex flex-col gap-3 mb-8">
                <a href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-8 h-8 border border-background/30 rounded-sm flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  WhatsApp: 0983 333 313
                </a>
                <a href="https://www.instagram.com/passion_.perfumes" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-8 h-8 border border-background/30 rounded-sm flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                  @passion_.perfumes
                </a>
                <a href="https://www.facebook.com/search/top?q=Passion%20Perfumes" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-8 h-8 border border-background/30 rounded-sm flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  Passion Perfumes
                </a>
                <a href="mailto:info@passionperfumes.com" className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-8 h-8 border border-background/30 rounded-sm flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  info@passionperfumes.com
                </a>
              </div>
            </motion.div>
            <motion.form onSubmit={handleContact} className="space-y-4" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div>
                <label className="text-xs tracking-widest uppercase opacity-60 mb-2 block">Nombre</label>
                <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Tu nombre completo" required className="bg-background/10 border-background/20 text-background placeholder:text-background/40 rounded-sm focus-visible:ring-background/30" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase opacity-60 mb-2 block">Teléfono</label>
                <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+595 983 333 313" className="bg-background/10 border-background/20 text-background placeholder:text-background/40 rounded-sm focus-visible:ring-background/30" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase opacity-60 mb-2 block">Mensaje</label>
                <Textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} placeholder="¿En qué podemos ayudarte?" rows={4} required className="bg-background/10 border-background/20 text-background placeholder:text-background/40 rounded-sm focus-visible:ring-background/30 resize-none" />
              </div>
              <Button type="submit" className="w-full bg-background text-foreground hover:bg-background/90 rounded-sm text-xs tracking-wider uppercase py-6 gap-2">
                <Send className="w-4 h-4" />
                Enviar por WhatsApp
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <img src="https://hercules-cdn.com/file_C16P4Sgny9lWcaa1ibK4GgJr" alt="Passion Perfumes y Cosméticos" className="h-12 w-auto object-contain mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Fragancias, cosméticos y productos de belleza seleccionados para cada estilo y ocasión.</p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase mb-4">Navegación</p>
              <div className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase mb-4">Contacto</p>
              <div className="flex flex-col gap-3">
                <a href={whatsappLink("Hola!")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4" /> 0983 333 313
                </a>
                <a href="https://www.instagram.com/passion_.perfumes" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  @passion_.perfumes
                </a>
                <a href="https://www.facebook.com/search/top?q=Passion%20Perfumes" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Passion Perfumes
                </a>
                <a href="mailto:info@passionperfumes.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Passion Perfumes y Cosméticos. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Diseño y estrategia digital por{" "}
              <span className="font-medium text-foreground">AD Agencia Publicitaria</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
