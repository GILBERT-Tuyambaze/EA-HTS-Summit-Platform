import { useEffect, useState } from 'react';
type AuditEvent = { id: string; action: string; target: string; admin_id?: string | null; created_at: string };

export default function AuditTimeline() {
  const [events, setEvents] = useState<AuditEvent[]>([]); const [error, setError] = useState(false);
  useEffect(() => { const token = sessionStorage.getItem('eahts-admin-token'); fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/audit?limit=6`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(async r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => setEvents(data.events ?? [])).catch(() => setError(true)); }, []);
  return (
    <div className="audit-timeline-card">
      <div className="audit-header">
        <p className="eyebrow admin-eyebrow">ACTIVITY LOG</p>
        <h2>Recent audit events</h2>
      </div>
      <div className="timeline-list">
        {error ? <div className="empty">Activity is temporarily unavailable.</div> : events.length === 0 ? <div className="empty">No admin actions recorded yet.</div> : events.map((event) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-time">{new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(event.created_at))}</div>
            <div>
              <strong>{event.action.replace(/\./g, ' ')}</strong>
              <p>{event.target}{event.admin_id ? ` · ${event.admin_id}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
