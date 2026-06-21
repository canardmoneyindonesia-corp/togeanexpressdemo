import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { LayoutDashboard, Users, Receipt, Ship } from "lucide-react";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdmin();

  // Login page (not authed) renders without the admin chrome.
  if (!authed) return <>{children}</>;

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/agents", label: "Agents", icon: Users },
    { href: "/admin/bookings", label: "Bookings", icon: Receipt },
    { href: "/admin/trips", label: "Trips", icon: Ship },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-ocean-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link
            href="/admin"
            className="font-black uppercase tracking-tight text-ocean-900"
          >
            Togean <span className="text-ocean-500">Express</span>
            <span className="ml-1 font-semibold normal-case tracking-normal text-ocean-400">
              · Admin
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ocean-700 hover:bg-ocean-100"
              >
                <n.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{n.label}</span>
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
