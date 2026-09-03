import type { ReactNode } from 'react';
import { Activity, CircleDollarSign, Globe2, LayoutDashboard, LogOut, Mail, Settings, Sparkles, Users } from 'lucide-react';
import { clearAdminSession } from '../services/registrationService';

const items = [
  ['Dashboard', '/admin', LayoutDashboard], ['Participants', '/admin/participants', Users], ['Communications', '/admin/email', Mail],
  ['Partners', '/admin/partners', Globe2], ['Programme', '/admin/program', Sparkles], ['Finance', '/admin/finance', CircleDollarSign], ['Operations', '/admin/operations', Activity],
] as const;

export default function AdminWorkspaceLayout({ title, description, children, hideTopbar = false }: { title: string; description: string; children: ReactNode; hideTopbar?: boolean }) {
  const navigate = (path: string) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };
  const current = window.location.pathname.replace(/\/+$/, '') || '/admin';
  return <div className="admin-root command-shell"><aside className="admin-sidebar command-sidebar"><button className="command-brand" onClick={() => window.location.assign('/')}><span>IEEE</span><strong>EA-HTS</strong></button><p className="command-event">SUMMIT 2027</p><nav className="command-nav" aria-label="Admin navigation">{items.map(([label, path, Icon]) => <button key={path} className={`command-nav-item${current === path ? ' active' : ''}`} onClick={() => navigate(path)}><Icon size={18} /> {label}</button>)}</nav><div className="command-sidebar-bottom"><button className={`command-nav-item muted${current === '/admin/settings' ? ' active' : ''}`} onClick={() => navigate('/admin/settings')}><Settings size={18} /> Settings</button><button className="command-nav-item" onClick={() => { clearAdminSession(); window.location.assign('/'); }}><LogOut size={18} /> Sign out</button></div></aside><main className="admin-main command-main">{!hideTopbar && <header className="command-topbar"><div className="event-switcher"><span className="event-mark">E</span><span><strong>EA Humanitarian Technology Summit</strong><small>Kigali · 14–16 Jan 2027</small></span></div><span className="admin-avatar">A</span></header>}<section className="workspace-heading admin-workspace-title"><div><p className="eyebrow admin-eyebrow">EA-HTS COMMAND CENTER</p><h1>{title}</h1><p>{description}</p></div><small>Last synced just now</small></section>{children}</main></div>;
}
