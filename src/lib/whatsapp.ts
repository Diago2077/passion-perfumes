export const WHATSAPP_NUMBER = "595983333313"; // +595 (Paraguay) 0983 333 313

export function whatsappLink(msg?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}
