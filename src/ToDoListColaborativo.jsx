import React, { useEffect, useState } from "react";

/**
 * Prado's Tareas — Vite + React + json-server
 * + Botón completar/deshacer fijo (28x28) y alineado con títulos largos
 * + Contadores globales (restantes / completadas)
 */

// ---------------- API URL resolver (robusto) ----------------
const DEFAULT_API_URL = "http://localhost:3000";
function resolveApiUrl() {
  let url = DEFAULT_API_URL;
  try { if (typeof window !== "undefined" && window.__API_URL__) url = window.__API_URL__; } catch {}
  try { url = (import.meta?.env?.VITE_API_URL) ?? url; } catch {}
  try { if (typeof process !== "undefined") url = process?.env?.VITE_API_URL ?? url; } catch {}
  try { if (typeof localStorage !== "undefined") url = localStorage.getItem("VITE_API_URL") ?? url; } catch {}
  return url;
}
export const API_URL = resolveApiUrl();
const PAGE_SIZE = 6;

// ---------------- utils ----------------
const nowIso = () => new Date().toISOString();
const prettyDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// ---------------- Toasts ----------------
function Toast({ item, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [onDone]);

  const icon = item.type === "success" ? "✓" : item.type === "error" ? "✕" : "i";

  return (
    <div
      className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white/95 text-black shadow-2xl ring-1 ring-black/10 animate-[fadeIn_.2s_ease,slideIn_.2s_ease]"
      style={{ transformOrigin: "top right" }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white text-lg">
            {icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold">{item.title}</p>
            {item.message && <p className="mt-1 text-sm opacity-80">{item.message}</p>}
          </div>
          <button onClick={onDone} className="ml-3 inline-flex rounded-xl p-2 text-black/70 hover:bg-black/5" aria-label="Cerrar">✕</button>
        </div>
      </div>
    </div>
  );
}
function useToasts() {
  const [queue, setQueue] = useState([]);
  const newId = () => {
    try { return self?.crypto?.randomUUID?.() ?? (Math.random().toString(36).slice(2) + Date.now().toString(36)); }
    catch { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  };
  const add = (t) => setQueue((q) => [...q, { id: newId(), ...t }]);
  const remove = (id) => setQueue((q) => q.filter((x) => x.id !== id));
  const ui = (
    <div className="fixed right-4 top-4 z-50 flex w-[min(100%,26rem)] flex-col items-end gap-2">
      {queue.map((t) => <Toast key={t.id} item={t} onDone={() => remove(t.id)} />)}
    </div>
  );
  return { add, ui };
}

// ---------------- Modal base ----------------
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_.15s_ease]" onClick={onClose} />
      <div className="relative z-50 w-full max-w-xl rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl animate-[popIn_.2s_ease]">
        {children}
      </div>
    </div>
  );
}

// ---------------- Controles ----------------
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/80">{label}</span>
      {children}
    </label>
  );
}
function TextInput(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white " +
        "placeholder-white/40 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 " +
        "shadow-inner shadow-black/20 transition " + (props.className || "")
      }
    />
  );
}
function TextArea(props) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/40 " +
        "outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 min-h-[120px] shadow-inner shadow-black/20 transition " +
        (props.className || "")
      }
    />
  );
}
function Button({ children, variant = "solid", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/20";
  const styles =
    variant === "solid"
      ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-shadow"
      : variant === "ghost"
      ? "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:shadow-lg hover:shadow-pink-500/40"
      : "border border-white/15 bg-black/60 text-white hover:border-white/30 hover:bg-white/5 hover:shadow-lg hover:shadow-purple-500/40";
  return <button {...props} className={`${base} ${styles} ${className}`}>{children}</button>;
}

// ---------------- API helpers ----------------
async function apiListTasks({ page, q }) {
  const url = new URL(`${API_URL}/tasks`);
  url.searchParams.set("_page", String(page));
  url.searchParams.set("_limit", String(PAGE_SIZE));
  if (q) url.searchParams.set("q", q);
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Error cargando tareas");
  const data = await res.json();
  const total = Number(res.headers.get("X-Total-Count")) || data.length;
  return { data, total };
}
async function apiCreateTask(task) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("No se pudo crear la tarea");
  return res.json();
}
async function apiPatchTask(id, changes) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!res.ok) throw new Error("No se pudo actualizar");
  return res.json();
}
async function apiDeleteTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar");
}
// Cuenta global de tareas completadas/restantes usando X-Total-Count.
async function apiCountAll() {
  async function countByCompleted(flag) {
    const url = new URL(`${API_URL}/tasks`);
    url.searchParams.set("completed", String(flag));
    url.searchParams.set("_page", "1");
    url.searchParams.set("_limit", "1"); // solo para obtener el header
    const res = await fetch(url);
    if (!res.ok) return 0;
    return Number(res.headers.get("X-Total-Count")) || 0;
  }
  const [completed, remaining] = await Promise.all([countByCompleted(true), countByCompleted(false)]);
  return { completed, remaining, total: completed + remaining };
}
async function apiLogin({ username, password }) {
  const url = new URL(`${API_URL}/users`);
  url.searchParams.set("username", username);
  url.searchParams.set("password", password);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error de red");
  const users = await res.json();
  return users[0] || null;
}

// ---------------- Auth ----------------
function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tdlc_user") || "null"); }
    catch { return null; }
  });
  function login(u) {
    setUser(u);
    localStorage.setItem("tdlc_user", JSON.stringify(u));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem("tdlc_user");
  }
  return { user, login, logout };
}

// ---------------- UI de Tareas ----------------
function CheckButton({ checked, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={checked}
      className={
        // tamaño fijo y sin shrink
        "mt-1 grid h-7 w-7 flex-none place-items-center rounded-lg border transition " +
        (checked
          ? "border-emerald-400 bg-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,.35)]"
          : "border-white/30 bg-transparent hover:border-cyan-400")
      }
    >
      {/* Icono check solo si está marcado */}
      {checked && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

function TaskCard({ task, onEdit, onAskDelete, onToggle }) {
  const isDone = Boolean(task.completed);
  return (
    <div className="group rounded-3xl border border-white/10 bg-black/50 p-5 text-white shadow-xl backdrop-blur transition hover:border-cyan-400/40 hover:shadow-cyan-500/30 hover:bg-black/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CheckButton
            checked={isDone}
            onClick={() => onToggle(task)}
            title={isDone ? "Marcar como pendiente" : "Marcar como completada"}
          />
          <div className="min-w-0">
            <div className={"text-lg font-semibold tracking-tight leading-tight break-words " + (isDone ? "line-through opacity-70" : "")}>
              {task.title}
            </div>
            {isDone && (
              <span className="inline-block mt-1 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-300">
                Completada
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
          <Button variant="ghost" onClick={() => onEdit(task)}>Editar</Button>
          <Button variant="outline" onClick={() => onAskDelete(task)} className="rounded-full">Eliminar</Button>
        </div>
      </div>

      {task.description && (
        <p className={"mt-2 text-sm leading-relaxed break-words " + (isDone ? "text-white/60 line-through" : "text-white/80")}>
          {task.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-1 text-xs text-white/60 sm:grid-cols-2">
        <span>Creada por: <b className="text-white">{task.createdBy}</b></span>
        <span>Creada el: {prettyDate(task.createdAt)}</span>
        <span>Última edición: <b className="text-white">{task.updatedBy || "—"}</b></span>
        <span>Editada el: {prettyDate(task.updatedAt)}</span>
      </div>
    </div>
  );
}

function TaskForm({ initial, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const isEdit = Boolean(initial?.id);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ title: title.trim(), description: description.trim() }); }} className="space-y-4">
      <h2 className="text-xl font-semibold">{isEdit ? "Editar tarea" : "Nueva tarea"}</h2>
      <Field label="Título">
        <TextInput value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Preparar demo" required />
      </Field>
      <Field label="Descripción">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles opcionales" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

// ---------------- App ----------------
export default function ToDoListColaborativo() {
  const { user, login, logout } = useAuth();
  const { add, ui: toastUI } = useToasts();

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, task: null });
  const [confirm, setConfirm] = useState({ open: false, task: null });

  // contadores globales
  const [counts, setCounts] = useState({ completed: 0, remaining: 0, total: 0 });

  // título del documento
  useEffect(() => {
    const prev = document.title;
    document.title = "Prado's Tareas";
    return () => { document.title = prev; };
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function refresh() {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data, total }, cts] = await Promise.all([
        apiListTasks({ page, q: debounced }),
        apiCountAll(),
      ]);
      setTasks(data);
      setTotal(total);
      setCounts(cts);
    } catch {
      add({ type: "error", title: "No se pudieron cargar las tareas." });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user, page, debounced]);

  function openNew() { setModal({ open: true, task: null }); }
  function openEdit(task) { setModal({ open: true, task }); }
  function askDelete(task) { setConfirm({ open: true, task }); }

  async function handleCreate(values) {
    try {
      await apiCreateTask({
        ...values,
        completed: false,
        createdById: user.id,
        createdBy: user.name,
        createdAt: nowIso(),
        updatedById: user.id,
        updatedBy: user.name,
        updatedAt: nowIso(),
      });
      setModal({ open: false, task: null });
      add({ type: "success", title: "Tarea creada" });
      refresh();
    } catch {
      add({ type: "error", title: "Error creando la tarea" });
    }
  }
  async function handleEdit(values) {
    try {
      await apiPatchTask(modal.task.id, {
        ...values,
        updatedById: user.id,
        updatedBy: user.name,
        updatedAt: nowIso(),
      });
      setModal({ open: false, task: null });
      add({ type: "success", title: "Tarea actualizada" });
      refresh();
    } catch {
      add({ type: "error", title: "No se pudo actualizar" });
    }
  }
  async function handleToggle(task) {
    try {
      const newCompleted = !task.completed;
      await apiPatchTask(task.id, {
        completed: newCompleted,
        updatedById: user.id,
        updatedBy: user.name,
        updatedAt: nowIso(),
      });
      add({ type: "success", title: newCompleted ? "Tarea completada" : "Tarea marcada como pendiente" });
      refresh();
    } catch {
      add({ type: "error", title: "No se pudo cambiar el estado" });
    }
  }
  async function handleDelete(task) {
    try {
      await apiDeleteTask(task.id);
      add({ type: "success", title: "Tarea eliminada" });
      refresh();
    } catch {
      add({ type: "error", title: "No se pudo eliminar" });
    } finally {
      setConfirm({ open: false, task: null });
    }
  }

  // Fondo dinámico con “luces”
  const bgStyle = {
    background:
      "radial-gradient(1200px 600px at -10% -10%, rgba(168, 85, 247, 0.10), transparent 60%)," +
      "radial-gradient(800px 400px at 110% 0%, rgba(34, 211, 238, 0.10), transparent 50%)," +
      "#0a0a0a",
  };

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={bgStyle}>
        {toastUI}
        <LoginCard onSuccess={login} toasts={{ add }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 text-white" style={bgStyle}>
      {toastUI}
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Prado's Tareas
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Sesión: <b className="text-white">{user.name}</b> • json-server • búsqueda • paginación
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={logout}>Cerrar sesión</Button>
        </header>

        {/* Top bar */}
        <section className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white/80">
                Restantes: <b className="text-white">{counts.remaining}</b>
              </div>
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                Completadas: <b className="text-emerald-200">{counts.completed}</b>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white/80">
                Total: <b className="text-white">{counts.total}</b>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar tareas..."
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">⌕</span>
              </div>
              <Button onClick={openNew}>+ Nueva</Button>
            </div>
          </div>
        </section>

        {/* Grid / lista */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-3xl border border-white/10 bg-black/40" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/40 p-10 text-center text-white/80 backdrop-blur hover:border-cyan-400/40 hover:shadow-cyan-500/30 transition">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">✨</div>
              <p className="mb-4">No hay tareas. Crea la primera</p>
              <Button onClick={openNew}>+ Nueva tarea</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={openEdit} onAskDelete={askDelete} onToggle={handleToggle} />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-white/60">
                  Página {page} de {Math.max(1, Math.ceil(total / PAGE_SIZE))} — {total} tareas
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-full" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setPage((p) => p + 1)} disabled={page * PAGE_SIZE >= total}>Siguiente →</Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* MODAL: Crear/Editar */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, task: null })}>
        <TaskForm initial={modal.task} onCancel={() => setModal({ open: false, task: null })} onSubmit={modal.task ? handleEdit : handleCreate} />
      </Modal>

      {/* MODAL: Confirmar borrar */}
      <Modal open={confirm.open} onClose={() => setConfirm({ open: false, task: null })}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">¿Eliminar esta tarea?</h2>
          <p className="text-white/80">“{confirm.task?.title}”</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm({ open: false, task: null })}>Cancelar</Button>
            <Button variant="outline" onClick={() => handleDelete(confirm.task)}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---- Animaciones Tailwind (keyframes) ----
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideIn { from { transform: translateY(-6px) } to { transform: translateY(0) } }
@keyframes popIn { from { transform: scale(.98) } to { transform: scale(1) } }
*/
