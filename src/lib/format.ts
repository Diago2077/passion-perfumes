export const CATEGORY_LABELS: Record<string, string> = {
  femenino: "Perfume Femenino",
  masculino: "Perfume Masculino",
  arabe: "Perfume Árabe",
  cosmetico: "Cosméticos",
  oferta: "Oferta",
  novedad: "Novedad",
};

export function formatPrice(price: number | null): string {
  if (price == null) return "";
  return `₲ ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export type DisplayProduct = {
  id?: string;
  code: string | null;
  name: string;
  category: string;
  categorySlug?: string | null;
  brand?: string | null;
  brandSlug?: string | null;
  desc: string;
  price: string;
  img: string;
};
