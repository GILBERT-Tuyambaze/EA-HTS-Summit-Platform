import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import AdminWorkspaceLayout from '../layouts/AdminWorkspaceLayout';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import '../styles/admin.css';
import '../styles/admin-drawer.css';
import {
  createSession,
  createSpeaker,
  deleteSession,
  deleteSpeaker,
  getProgram,
  updateSession,
  updateSpeaker,
  type SessionInput,
  type SessionRecord,
  type SpeakerInput,
  type SpeakerRecord,
} from '../services/programService';

const sessionBlank: SessionInput = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  track: '',
  speakerId: null,
  speakerIds: [],
};

const speakerBlank: SpeakerInput = { name: '', organization: '', email: '', biography: '', image: null };

export default function ProgramPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerRecord[]>([]);
  const [stats, setStats] = useState({ sessions: 0, speakers: 0, tracks: 0, rooms: 0 });
  const [loading, setLoading] = useState(true);

  const [sessionForm, setSessionForm] = useState<SessionInput>(sessionBlank);
  const [speakerForm, setSpeakerForm] = useState<SpeakerInput>(speakerBlank);
  const [editSession, setEditSession] = useState<SessionRecord | null>(null);
  const [editSpeaker, setEditSpeaker] = useState<SpeakerRecord | null>(null);
  const [dialog, setDialog] = useState<'session' | 'speaker' | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'save-session' | 'save-speaker' | 'delete-session' | 'delete-speaker'; id?: string } | null>(null);

  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerRecord | null>(null);
  const [drawerSessionForm, setDrawerSessionForm] = useState<SessionInput>(sessionBlank);
  const [drawerSpeakerForm, setDrawerSpeakerForm] = useState<SpeakerInput>(speakerBlank);
  const [programAction, setProgramAction] = useState<'view' | 'update' | 'approve' | 'reject'>('view');

  const { showPopup } = usePopup();
  const { openProgress, closeProgress } = useProgress();

  const load = async () => {
    setLoading(true);
    try {
      const x = await getProgram();
      setSessions(x.sessions);
      setSpeakers(x.speakers);
      setStats(x.stats);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unable to load program.';
      if (msg && msg.toLowerCase().includes('access denied')) {
        showPopup({ type: 'error', message: 'Admin access required. Please sign in to view speakers.' });
      } else {
        showPopup({ type: 'error', message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSpeakers = async () => {
    try {
      const x = await getProgram();
      setSpeakers(x.speakers);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load speakers.';
      showPopup({ type: 'error', message: msg });
      throw e;
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const execute = async () => {
    if (!confirm) return;
    const deletion = confirm.kind.startsWith('delete');

    openProgress({
      title: deletion ? 'Removing program record' : 'Saving program record',
      description: 'Updating the database and creating an audit record.',
      steps: [{ label: 'Saving changes', status: 'active' }],
    });

    try {
      if (confirm.kind === 'save-session') {
        if (editSession) {
          const updated = await updateSession(editSession.id, sessionForm);
          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        } else {
          const created = await createSession(sessionForm);
          setSessions((prev) => [created, ...prev]);
        }
        setDialog(null);
      }

      if (confirm.kind === 'save-speaker') {
        if (editSpeaker) {
          const updated = await updateSpeaker(editSpeaker.id, speakerForm);
          setSpeakers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        } else {
          const created = await createSpeaker(speakerForm);
          setSpeakers((prev) => [created, ...prev]);
        }
        setDialog(null);
      }

      if (confirm.kind === 'delete-session' && confirm.id) {
        await deleteSession(confirm.id);
        setSessions((prev) => prev.filter((s) => s.id !== confirm.id));
      }

      if (confirm.kind === 'delete-speaker' && confirm.id) {
        await deleteSpeaker(confirm.id);
        setSpeakers((prev) => prev.filter((s) => s.id !== confirm.id));
      }

      // Refresh canonical data to ensure consistency
      await load();

      let successMsg = '';
      if (deletion) successMsg = 'Program record removed successfully.';
      else if (confirm.kind === 'save-speaker') successMsg = editSpeaker ? 'Speaker updated.' : 'Speaker created.';
      else if (confirm.kind === 'save-session') successMsg = editSession ? 'Session updated.' : 'Session created.';
      else successMsg = 'Program record saved successfully.';

      // update stats counters locally for immediate feedback
      if (confirm.kind === 'save-speaker' && !editSpeaker) {
        setStats((p) => ({ ...p, speakers: p.speakers + 1 }));
      }
      if (confirm.kind === 'delete-speaker' && confirm.id) {
        setStats((p) => ({ ...p, speakers: Math.max(0, p.speakers - 1) }));
      }
      if (confirm.kind === 'save-session' && !editSession) {
        setStats((p) => ({ ...p, sessions: p.sessions + 1 }));
      }
      if (confirm.kind === 'delete-session' && confirm.id) {
        setStats((p) => ({ ...p, sessions: Math.max(0, p.sessions - 1) }));
      }

      showPopup({ type: 'success', message: successMsg });
    } catch (e) {
      showPopup({ type: 'error', message: e instanceof Error ? e.message : 'Unable to complete action.' });
    } finally {
      closeProgress();
      setConfirm(null);
    }
  };

  const openSession = (x?: SessionRecord) => {
    setEditSession(x ?? null);
    setSessionForm(
      x
        ? { title: x.title, description: x.description, date: x.date, startTime: x.startTime, endTime: x.endTime, location: x.location, track: x.track, speakerId: x.speakerId, speakerIds: x.speakerIds ?? (x.speakerId ? [x.speakerId] : []) }
        : sessionBlank
    );
    // If speakers haven't been loaded yet (or were empty), try to refresh them so the select is populated
    if (!speakers || speakers.length === 0) {
      void loadSpeakers().then(() => setDialog('session'));
    } else {
      setDialog('session');
    }
  };

  const openSpeaker = (x?: SpeakerRecord) => {
    setEditSpeaker(x ?? null);
    setSpeakerForm(x ? { name: x.name, organization: x.organization, email: x.email, biography: x.biography, image: x.image } : speakerBlank);
    setDialog('speaker');
  };

  const openSessionDetails = (x: SessionRecord) => {
    setSelectedSession(x);
    setDrawerSessionForm({ title: x.title, description: x.description, date: x.date, startTime: x.startTime, endTime: x.endTime, location: x.location, track: x.track, speakerId: x.speakerId, speakerIds: x.speakerIds ?? (x.speakerId ? [x.speakerId] : []) });
    setProgramAction('view');
  };

  const openSpeakerDetails = (x: SpeakerRecord) => {
    setSelectedSpeaker(x);
    setDrawerSpeakerForm({ name: x.name, organization: x.organization, email: x.email, biography: x.biography, image: x.image });
    setProgramAction('view');
  };

  const closeProgramDrawer = () => {
    setSelectedSession(null);
    setSelectedSpeaker(null);
    setProgramAction('view');
  };

  const updateDrawerSessionField = (key: keyof SessionInput, value: string) => {
    setDrawerSessionForm((current) => ({ ...current, [key]: value }));
  };

  const updateDrawerSpeakerField = (key: keyof SpeakerInput, value: string) => {
    setDrawerSpeakerForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <AdminWorkspaceLayout title="Program" description="Manage summit sessions, speakers, and schedule delivery.">
      <section className="metric-grid finance-metrics">
        {[['Sessions', stats.sessions], ['Speakers', stats.speakers], ['Tracks', stats.tracks], ['Locations', stats.rooms]].map(([l, v]) => (
          <article className="metric-card" key={String(l)}>
            <span>{l}</span>
            <strong>{v}</strong>
          </article>
        ))}
      </section>

      <section className="command-workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">SESSION MANAGEMENT</p>
            <h2>Schedule</h2>
          </div>
          <button className="btn btn-primary" onClick={() => openSession()}>
            Create session
          </button>
        </div>

        {loading ? (
          <div className="workspace-loading">Loading sessions</div>
        ) : (
          <div className="program-table-wrap">
            <table className="registrations-table program-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date / time</th>
                  <th>Location</th>
                  <th>Track</th>
                  <th>Speakers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length ? (
                  sessions.map((s) => (
                    <tr key={s.id} onClick={() => openSessionDetails(s)} style={{ cursor: 'pointer' }}>
                      <td>{s.title}</td>
                      <td>
                        {s.date} {s.startTime}–{s.endTime}
                      </td>
                      <td>{s.location}</td>
                      <td>{s.track}</td>
                      <td>{s.speakerNames && s.speakerNames.length > 0 ? s.speakerNames.join(', ') : 'Unassigned'}</td>
                      <td>
                        <button
                          className="text-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openSession(s);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-button danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            setConfirm({ kind: 'delete-session', id: s.id });
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No sessions have been created.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="command-workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">SPEAKERS</p>
            <h2>Speaker directory</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => openSpeaker()}>
              Add speaker
            </button>
            <button className="text-button" onClick={() => void loadSpeakers()}>
              Reload speakers
            </button>
          </div>
        </div>

        <div className="program-table-wrap">
          <table className="registrations-table program-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organisation</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {speakers.length ? (
                speakers.map((s) => (
                  <tr key={s.id} onClick={() => openSpeakerDetails(s)} style={{ cursor: 'pointer' }}>
                    <td>{s.name}</td>
                    <td>{s.organization || '—'}</td>
                    <td>{s.email || '—'}</td>
                    <td>
                      <button
                        className="text-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openSpeaker(s);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirm({ kind: 'delete-speaker', id: s.id });
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No speakers have been created.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(selectedSession || selectedSpeaker) && (
        <>
          <div className="drawer-overlay" onClick={closeProgramDrawer} />
          <aside className="detail-drawer open" role="dialog" aria-label="Program details">
            <button className="drawer-close" onClick={closeProgramDrawer} aria-label="Close details">
              ✕
            </button>

            <div className="detail-header">
              <div>
                <p className="eyebrow admin-eyebrow">{selectedSession ? 'Session snapshot' : 'Speaker snapshot'}</p>
                <h2>{selectedSession ? selectedSession.title : selectedSpeaker?.name}</h2>
                <p style={{ marginTop: 8, color: '#6b778c' }}>{selectedSession ? `${selectedSession.date} ${selectedSession.startTime}–${selectedSession.endTime}` : selectedSpeaker?.organization || 'Review speaker details'}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                {selectedSession ? (
                  <>
                    <h3>Session details</h3>
                    <ul>
                      <li>
                        <strong>Track:</strong> {selectedSession.track}
                      </li>
                      <li>
                        <strong>Location:</strong> {selectedSession.location}
                      </li>
                      <li>
                        <strong>Speakers:</strong> {(selectedSession.speakerNames && selectedSession.speakerNames.length > 0) ? selectedSession.speakerNames.join(', ') : 'Unassigned'}
                      </li>
                      <li>
                        <strong>Description:</strong> {selectedSession.description || 'No description provided.'}
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h3>Speaker details</h3>
                    <ul>
                      <li>
                        <strong>Organisation:</strong> {selectedSpeaker?.organization || '—'}
                      </li>
                      <li>
                        <strong>Email:</strong> {selectedSpeaker?.email || '—'}
                      </li>
                      <li>
                        <strong>Biography:</strong> {selectedSpeaker?.biography || 'No biography provided.'}
                      </li>
                    </ul>
                  </>
                )}
              </div>

              <div className="detail-card">
                <h3>Action review</h3>
                <label className="program-form-field program-form-field-full">
                  <span>Change type</span>
                  <select value={programAction} onChange={(e) => setProgramAction(e.target.value as typeof programAction)}>
                    <option value="view">View only</option>
                    <option value="update">Review / request changes</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </label>

                {programAction === 'update' ? (
                  <p style={{ marginTop: 12 }}>Update the record and then open the review form.</p>
                ) : programAction === 'approve' ? (
                  <p style={{ marginTop: 12, color: '#0c5a10' }}>Approve this program record after verifying the details.</p>
                ) : programAction === 'reject' ? (
                  <p style={{ marginTop: 12, color: '#8f1d20' }}>Reject this program record if it should not be included.</p>
                ) : (
                  <p style={{ marginTop: 12 }}>Select an action to move forward.</p>
                )}

                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (programAction === 'update') {
                        if (selectedSession) {
                          setEditSession(selectedSession);
                          setSessionForm(drawerSessionForm);
                          setDialog('session');
                        } else if (selectedSpeaker) {
                          setEditSpeaker(selectedSpeaker);
                          setSpeakerForm(drawerSpeakerForm);
                          setDialog('speaker');
                        }
                        closeProgramDrawer();
                      } else if (programAction === 'approve') {
                        showPopup({ type: 'success', message: 'Program record approved.' });
                        closeProgramDrawer();
                      } else if (programAction === 'reject') {
                        showPopup({ type: 'error', message: 'Program record rejected.' });
                        closeProgramDrawer();
                      }
                    }}
                    disabled={programAction === 'view'}
                  >
                    {programAction === 'approve' ? 'Approve' : programAction === 'reject' ? 'Reject' : 'Review and save'}
                  </button>

                  <button type="button" className="text-button" onClick={closeProgramDrawer}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        className="program-form-modal"
        open={dialog === 'session'}
        title="Session details"
        description="Review and save the session information."
        topBar={
          <div className="program-form-header">
            <button type="button" className="program-form-back" onClick={() => setDialog(null)}>
              ← Sessions
            </button>
            <div>
              <h2>{editSession ? 'Edit session' : 'Create Session'}</h2>
              <p>Schedule a session and assign speakers.</p>
            </div>
          </div>
        }
        confirmLabel="Review changes"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (!sessionForm.title || !sessionForm.date || !sessionForm.startTime || !sessionForm.endTime || !sessionForm.location || !sessionForm.track) {
            showPopup({ type: 'error', message: 'Complete the required session information.' });
            return;
          }
          setConfirm({ kind: 'save-session' });
        }}
      >
        <div className="program-form-shell">
          <div className="program-form-body">
            <aside className="program-form-side">
              <div className="program-form-side-panel">
                <strong>Create Session</strong>
                <p>Schedule a new session for the conference.</p>
                <div className="program-form-step-list">
                  <div className="program-form-step active">✔ Session Info</div>
                  <div className="program-form-step active">✔ Speaker</div>
                  <div className="program-form-step">✔ Review</div>
                </div>
              </div>
            </aside>

            <div className="program-form-main">
              <div className="program-form-grid">
                <label className="program-form-field program-form-field-full">
                  <span>Session Title</span>
                  <input value={sessionForm.title} onChange={(e) => setSessionForm((x) => ({ ...x, title: e.target.value }))} placeholder="Enter session title" />
                </label>

                <label className="program-form-field">
                  <span>Date</span>
                  <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm((x) => ({ ...x, date: e.target.value }))} />
                </label>

                <label className="program-form-field">
                  <span>Start Time</span>
                  <input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm((x) => ({ ...x, startTime: e.target.value }))} />
                </label>

                <label className="program-form-field">
                  <span>End Time</span>
                  <input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm((x) => ({ ...x, endTime: e.target.value }))} placeholder="Enter end time" />
                </label>

                <label className="program-form-field">
                  <span>Location</span>
                  <input value={sessionForm.location} onChange={(e) => setSessionForm((x) => ({ ...x, location: e.target.value }))} placeholder="Enter location" />
                </label>

                <label className="program-form-field">
                  <span>Track</span>
                  <input value={sessionForm.track} onChange={(e) => setSessionForm((x) => ({ ...x, track: e.target.value }))} placeholder="Enter track" />
                </label>

                <label className="program-form-field program-form-field-full">
                  <span>Speakers</span>
                  <select
                    multiple
                    value={sessionForm.speakerIds ?? []}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions || []);
                      const vals = options.map((o) => o.value);
                      setSessionForm((x) => ({ ...x, speakerIds: vals }));
                    }}
                  >
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="program-form-field program-form-field-full">
                  <span>Description</span>
                  <textarea value={sessionForm.description} onChange={(e) => setSessionForm((x) => ({ ...x, description: e.target.value }))} placeholder="Describe the session focus and outcomes" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        className="program-form-modal"
        open={dialog === 'speaker'}
        title={editSpeaker ? 'Edit speaker' : 'Add speaker'}
        description="Provide the speaker profile details."
        confirmLabel="Review changes"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (!speakerForm.name) {
            showPopup({ type: 'error', message: 'Speaker name is required.' });
            return;
          }
          setConfirm({ kind: 'save-speaker' });
        }}
      >
        <div className="program-form-shell">
          <div className="program-form-grid">
            <label className="program-form-field">
              <span>Speaker name</span>
              <input value={speakerForm.name} onChange={(e) => setSpeakerForm((x) => ({ ...x, name: e.target.value }))} placeholder="Name *" />
            </label>

            <label className="program-form-field">
              <span>Organisation</span>
              <input value={speakerForm.organization} onChange={(e) => setSpeakerForm((x) => ({ ...x, organization: e.target.value }))} placeholder="Organisation" />
            </label>

            <label className="program-form-field">
              <span>Email</span>
              <input type="email" value={speakerForm.email} onChange={(e) => setSpeakerForm((x) => ({ ...x, email: e.target.value }))} placeholder="Email" />
            </label>

            <label className="program-form-field program-form-field-full">
              <span>Biography</span>
              <textarea value={speakerForm.biography} onChange={(e) => setSpeakerForm((x) => ({ ...x, biography: e.target.value }))} placeholder="Tell us about this speaker's expertise and session contribution" />
            </label>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.kind.startsWith('delete') ? 'Delete program record?' : 'Save program record?'}
        description={confirm?.kind.startsWith('delete') ? 'This permanently removes the record.' : 'This creates or updates the record.'}
        confirmLabel={confirm?.kind.startsWith('delete') ? 'Delete' : 'Save'}
        destructive={confirm?.kind.startsWith('delete')}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void execute()}
      />
    </AdminWorkspaceLayout>
  );
}
