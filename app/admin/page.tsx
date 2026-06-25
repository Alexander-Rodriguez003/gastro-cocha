import { getAdminStats } from "@/lib/data";
import { LayoutDashboard, Utensils, MapPin, MessageSquare, Bell, Users } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
        <LayoutDashboard size={28} color="var(--color-primary)" /> Panel de Administración
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Gestiona tu guía gastronómica</p>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Utensils size={24} />} label="Platos Activos" value={stats.totalPlatos} color="var(--color-primary)" />
        <StatCard icon={<MapPin size={24} />} label="Lugares Aprobados" value={stats.totalLugares} color="var(--color-secondary)" />
        <StatCard icon={<Bell size={24} />} label="Solicitudes Pendientes" value={stats.solicitudesPendientes} color="var(--color-accent)" alert={stats.solicitudesPendientes > 0} />
        <StatCard icon={<MessageSquare size={24} />} label="Reseñas Pendientes" value={stats.resenasPendientes} color="var(--color-info)" alert={stats.resenasPendientes > 0} />
        <StatCard icon={<Users size={24} />} label="Provincias" value={stats.totalProvincias} color="#8B5CF6" />
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.2rem", marginBottom: "1rem" }}>Acciones Rápidas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
        <AdminLink href="/admin/platos" icon="🍽️" title="Gestionar Platos" desc="Crear, editar o desactivar platos" />
        <AdminLink href="/admin/lugares" icon="📍" title="Gestionar Lugares" desc="Restaurantes y locales de carretera" />
        <AdminLink href="/admin/solicitudes" icon="📋" title="Solicitudes de Registro" desc={`${stats.solicitudesPendientes} pendientes de aprobación`} />
        <AdminLink href="/admin/resenas" icon="💬" title="Moderar Reseñas" desc={`${stats.resenasPendientes} reseñas por aprobar`} />
        <AdminLink href="/admin/propietarios" icon="🔑" title="Propietarios de Negocios" desc="Asignar accesos, crear y resetear contraseñas de dueños" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, alert }: { icon: React.ReactNode; label: string; value: number; color: string; alert?: boolean }) {
  return (
    <div className="card" style={{ padding: "1.25rem", position: "relative" }}>
      {alert && (
        <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent)" }} />
      )}
      <div style={{ color, marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem" }}>{value}</div>
      <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{label}</div>
    </div>
  );
}

function AdminLink({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
        <span style={{ fontSize: "1.75rem" }}>{icon}</span>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem" }}>{title}</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{desc}</div>
        </div>
      </div>
    </Link>
  );
}
