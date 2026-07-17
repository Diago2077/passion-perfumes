import { useEffect, useMemo, useState } from "react";
import { MessageSquare, CheckCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase, type Database } from "@/lib/supabase";

type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminContacts() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setMessages(data ?? []);
      setLoading(false);
    }
    fetchMessages();
  }, []);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: true })
      .eq("id", id);
    if (!error) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
      toast.success("Marcado como leído");
    } else {
      toast.error("Error: " + error.message);
    }
  }

  async function markAllRead() {
    const unread = messages.filter((m) => !m.read);
    if (unread.length === 0) return;
    const ids = unread.map((m) => m.id);
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: true })
      .in("id", ids);
    if (!error) {
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      toast.success(`${ids.length} mensajes marcados como leídos`);
    } else {
      toast.error("Error: " + error.message);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q)
    );
  }, [messages, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
  const paginatedMessages = filteredMessages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl mb-1">Mensajes de contacto</h1>
          <p className="text-sm text-muted-foreground">
            {search ? (
              `${filteredMessages.length} de ${messages.length} mensajes`
            ) : (
              <>
                {messages.length} mensajes
                {unreadCount > 0 && ` — ${unreadCount} sin leer`}
              </>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-xs tracking-widest uppercase border border-border px-4 py-2 rounded-sm hover:bg-muted/40 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todos como leídos
          </button>
        )}
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o mensaje..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/40 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay mensajes recibidos aún.</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ningún mensaje coincide con "{search}".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded-sm p-5 transition-colors ${
                msg.read
                  ? "border-border bg-card"
                  : "border-foreground/20 bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-sm">{msg.name}</p>
                  {!msg.read && (
                    <Badge variant="default" className="text-[10px]">
                      Nuevo
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</span>
                  {!msg.read && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      title="Marcar como leído"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {msg.phone && (
                <p className="text-xs text-muted-foreground mb-2">
                  Tel:{" "}
                  <a
                    href={`https://wa.me/${msg.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    {msg.phone}
                  </a>
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredMessages.length > PAGE_SIZE && (
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
