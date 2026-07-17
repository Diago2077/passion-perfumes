import type { DisplayProduct } from "./format";

export type DisplayCategory = {
  title: string;
  subtitle?: string;
  img: string;
  msg: string;
};

export const fallbackCategories: DisplayCategory[] = [
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

export const fallbackBrands: string[] = [
  "Dior", "Chanel", "YSL", "Lancôme", "Versace", "Carolina Herrera",
  "Hugo Boss", "Armani", "Burberry", "Montale", "Al Haramain", "Swiss Arabian",
];

export const fallbackProducts: DisplayProduct[] = [
  {
    code: null,
    name: "Rose Élixir",
    category: "Perfume Femenino",
    categorySlug: "femenino",
    brand: "Chanel",
    brandSlug: "chanel",
    desc: "Fragancia floral con notas de rosa damascena, jazmín y sándalo blanco.",
    price: "₲ 8.500",
    img: "https://images.unsplash.com/photo-1595425959632-34f2822322ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    code: null,
    name: "Oud Noir",
    category: "Perfume Árabe",
    categorySlug: "arabe",
    brand: "Al Haramain",
    brandSlug: "al-haramain",
    desc: "Fragancia oriental intensa con oud, ámbar y especias exóticas.",
    price: "₲ 12.900",
    img: "https://images.unsplash.com/photo-1611146264101-358a3b387eee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    code: null,
    name: "Gentleman Élite",
    category: "Perfume Masculino",
    categorySlug: "masculino",
    brand: "Hugo Boss",
    brandSlug: "hugo-boss",
    desc: "Fragancia amaderada con notas de vetiver, cuero y cedro.",
    price: "₲ 9.200",
    img: "https://images.unsplash.com/photo-1598634222670-87c5f558119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    code: null,
    name: "Gold Velvet",
    category: "Perfume Femenino",
    categorySlug: "femenino",
    brand: "Versace",
    brandSlug: "versace",
    desc: "Seductor y envolvente, con notas de vainilla, musgo y pétalos de rosa.",
    price: "₲ 10.400",
    img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    code: null,
    name: "Velvet Rouge",
    category: "Cosméticos",
    categorySlug: "cosmetico",
    brand: "Dior",
    brandSlug: "dior",
    desc: "Labial de larga duración con acabado satinado en tonos rojos y nude.",
    price: "₲ 3.800",
    img: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
  {
    code: null,
    name: "Aqua Fresca",
    category: "Perfume Masculino",
    categorySlug: "masculino",
    brand: "Armani",
    brandSlug: "armani",
    desc: "Fresco y dinámico, con notas cítricas, menta y madera de roble.",
    price: "₲ 7.600",
    img: "https://images.unsplash.com/photo-1553699357-fdefb876c402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
  },
];
