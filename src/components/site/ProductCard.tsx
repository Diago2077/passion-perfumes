import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import type { DisplayProduct } from "@/lib/format";

export function ProductCard({ p, delay = 0 }: { p: DisplayProduct; delay?: number }) {
  return (
    <motion.div
      className="bg-card border border-border rounded-sm overflow-hidden group flex flex-col"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="relative aspect-square overflow-hidden bg-white p-4">
        <img src={p.img} alt={p.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-sm">
          {p.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif text-xl">{p.name}</h3>
          {p.code && (
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-sm shrink-0 mt-1">
              {p.code}
            </span>
          )}
        </div>
        {p.brand && (
          <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">{p.brand}</p>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{p.desc}</p>
        <div className="mt-auto">
          {p.price && <p className="text-[21px] font-medium mb-3">{p.price}</p>}
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
      </div>
    </motion.div>
  );
}
