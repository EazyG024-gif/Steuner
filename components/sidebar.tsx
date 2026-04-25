'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  PenLine,
  BarChart2,
  Target,
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { LogoMark } from './logo';

const NAV = [
  { href: '/dashboard', label: 'Overzicht', icon: LayoutDashboard },
  { href: '/log', label: 'Dagboek', icon: PenLine },
  { href: '/history', label: 'Mijn ontwikkeling', icon: BarChart2 },
  { href: '/goals', label: 'Doelen', icon: Target },
  { href: '/uitleg', label: 'Uitleg', icon: BookOpen },
];

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={isDark ? 'Lichte modus' : 'Donkere modus'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function NavItem({ href, label, Icon }: { href: string; label: string; Icon: React.ElementType }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
      {label}
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full px-3 py-4">
      {/* Logo */}
      <div className="flex items-center justify-between mb-6 px-1">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="font-bold text-foreground tracking-tight text-[17px]">Steuner</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <div key={href} onClick={onClose}>
            <NavItem href={href} label={label} Icon={Icon} />
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex items-center justify-between px-1 pt-4 border-t border-border">
        <UserButton />
        <ThemeToggle />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[var(--sidebar-width)] flex-col border-r border-border bg-card z-30">
      <SidebarContent />
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LogoMark size={26} />
          <span className="font-bold text-foreground tracking-tight text-base">Steuner</span>
        </Link>
        <div className="flex items-center gap-2">
          <UserButton />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-card border-r border-border z-50 transition-transform duration-250 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
