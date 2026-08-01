import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowLeft, BarChart3, Bold, CircleDollarSign, FileText, Globe2, Italic, LayoutDashboard, Link2, LogOut, Mail, Send, Settings, Sparkles, Ticket, Trash2, Users, WalletCards, X } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { clearAdminSession, fetchRegistrations, getAdminSession, type RegistrationRecord } from '../services/registrationService';
import { getEmailTemplates, fetchEmailLogs, sendBulkEmail, previewEmail, type EmailAudience, type EmailCategory, type EmailTemplateRecord, type EmailLogRecord, type EmailType } from '../services/emailCenterService';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/admin.css';
import '../styles/email-center.css';

const emailTypes: ReadonlyArray<{ value: EmailType; label: string }> = [
  { value: 'manual', label: 'General manual message' },
  { value: 'registration-received', label: 'Registration confirmation' },
  { value: 'payment-confirmed', label: 'Payment confirmed' },
  { value: 'payment-reminder', label: 'Payment reminder' },
  { value: 'event-reminder', label: 'Event reminder' },
];

const manualTemplate: EmailTemplateRecord = {
  id: 'manual',
  name: 'General communication',
  category: 'operations',
  audience: 'Manual recipients',
  audience_json: { roles: ['operations'] },
  trigger: 'manual',
  type: 'manual',
  subject: 'General announcement from EA-HTS',
  preview_text: 'Compose a custom message and send it to selected recipients.',
  html_content: '',
  blocks_json: [],
  variables: ['name'],
  status: 'active',
  created_by: 'system',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const categories: ReadonlyArray<{ value: EmailCategory; label: string }> = [
  { value: 'participant', label: 'Participant Journey' },
  { value: 'speaker', label: 'Speaker Management' },
  { value: 'partner', label: 'Partner Relations' },
  { value: 'startup', label: 'Startup Challenge' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'operations', label: 'Operations' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'system', label: 'System' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function starterMessage(template: EmailTemplateRecord) {
  if (template.type === 'payment-reminder') return `This is a friendly reminder to complete your EA-HTS Summit 2027 registration payment.\n\nYour registration number: {{registrationNumber}}\n\nKind regards,\nEA-HTS Summit Secretariat`;
  if (template.type === 'registration-received') return `Welcome to the EA Humanitarian Technology Summit 2027. We are delighted to confirm that your registration has been received.\n\nYour registration number: {{registrationNumber}}\nCountry: {{country}}\n\nKind regards,\nEA-HTS Summit Secretariat`;
  if (template.type === 'event-reminder') return `The EA-HTS Summit begins soon. We look forward to welcoming you in Kigali.\n\nKind regards,\nEA-HTS Summit Secretariat`;
  return `We are pleased to share this update from the EA Humanitarian Technology Summit 2027.\n\nAdd your message here.\n\nKind regards,\nEA-HTS Summit Secretariat`;
}

export default function AdminEmailCenterPage({ onReturn }: { onReturn: () => void }) {
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [logs, setLogs] = useState<EmailLogRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'queued' | 'sent' | 'failed'>('all');
  const [emailType, setEmailType] = useState<EmailType | 'all'>('all');
  const [category, setCategory] = useState<EmailCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const { showPopup } = usePopup();
  const { openProgress, updateProgress, closeProgress } = useProgress();
  const [recipients, setRecipients] = useState<RegistrationRecord[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [manualRecipientName, setManualRecipientName] = useState('');
  const [manualRecipientEmail, setManualRecipientEmail] = useState('');
  const [manualRecipients, setManualRecipients] = useState<Array<{ email: string; fullName: string }>>([]);
  const [audienceMode, setAudienceMode] = useState<'everyone' | 'pending' | 'paid' | 'ieee' | 'country' | 'participantType'>('everyone');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('Rwanda');
  const [selectedParticipantTypeFilter, setSelectedParticipantTypeFilter] = useState('Professional');
  const [confirmSend, setConfirmSend] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailLogRecord | null>(null);
  const [composerStep, setComposerStep] = useState<0 | 1 | 2>(0);
  const composerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const loadTemplates = async () => {
      const session = getAdminSession();
      if (!session) return;
      const response = await getEmailTemplates();
      setTemplates(response.templates);
      if (response.templates.length > 0) {
        setSelectedTemplateId(response.templates[0].id);
        setSubject(response.templates[0].subject);
        setMessage(starterMessage(response.templates[0]));
      } else {
        setSelectedTemplateId(manualTemplate.id);
        setSubject(manualTemplate.subject);
        setMessage(starterMessage(manualTemplate));
      }
    };

    void loadTemplates();
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      const result = await fetchEmailLogs({ search, status: status !== 'all' ? status : undefined, emailType: emailType !== 'all' ? emailType : undefined, page, limit });
      setLogs(result.logs);
      setTotal(result.pagination.total);
    };

    void loadLogs();
  }, [search, status, emailType, page, limit]);

  useEffect(() => {
    const loadRecipients = async () => {
      const query = recipientSearch.trim() || undefined;
      const result = await fetchRegistrations({ search: query, limit: 50 });
      setRecipients(result.registrations);
    };

    void loadRecipients();
  }, [recipientSearch]);

  const displayedTemplates = useMemo(() => [manualTemplate, ...templates], [templates]);

  const filteredTemplates = useMemo(() => {
    return displayedTemplates.filter((template) => {
      const matchesCategory = category === 'all' || template.category === category;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        template.name.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query) ||
        template.audience.toLowerCase().includes(query) ||
        template.type.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [displayedTemplates, category, search]);

  const selectedTemplateRecord = useMemo(
    () => displayedTemplates.find((template) => template.id === selectedTemplateId) || filteredTemplates[0] || null,
    [displayedTemplates, selectedTemplateId, filteredTemplates],
  );

  useEffect(() => {
    if (!selectedTemplateId && filteredTemplates.length > 0) {
      setSelectedTemplateId(filteredTemplates[0].id);
      setSubject(filteredTemplates[0].subject);
      setMessage(starterMessage(filteredTemplates[0]));
    }
  }, [filteredTemplates, selectedTemplateId]);

  const handleSelectTemplate = (template: EmailTemplateRecord) => {
    setSelectedTemplateId(template.id);
    setSubject(template.subject);
    setMessage(starterMessage(template));
  };

  const onPreview = async () => {
    if (!selectedTemplateRecord) return;
    setIsPreviewing(true);
    try {
      const response = await previewEmail({
        registrationId: undefined,
        recipientEmail: 'preview@example.com',
        recipientName: 'Preview user',
        emailType: selectedTemplateRecord.type,
        subject: subject || selectedTemplateRecord.subject,
        message,
      });
      setPreviewHtml(response.html);
    } finally {
      setIsPreviewing(false);
    }
  };

  const onSendBulk = async () => {
    if (!selectedTemplateRecord) return;
    if (selectedTemplateRecord.type === 'manual' && selectedRecipientIds.length === 0 && manualRecipients.length === 0) {
      showPopup({ type: 'error', message: 'Please choose at least one recipient or add a manual recipient before sending.' });
      return;
    }

    openProgress({
      title: 'Sending communication',
      description: 'Processing your message and notifying recipients.',
      steps: [
        { label: 'Validating recipients', status: 'complete' },
        { label: 'Preparing communication', status: 'active' },
        { label: 'Sending messages', status: 'pending' },
        { label: 'Updating delivery status', status: 'pending' },
      ],
    });

    setIsSending(true);
    try {
      await sendBulkEmail({
        registrationIds: selectedRecipientIds.length > 0 ? selectedRecipientIds : undefined,
        recipients: manualRecipients.length > 0 ? manualRecipients : undefined,
        emailType: selectedTemplateRecord.type,
        subject: subject || selectedTemplateRecord.subject,
        message,
      });

      updateProgress({
        steps: [
          { label: 'Validating recipients', status: 'complete' },
          { label: 'Preparing communication', status: 'complete' },
          { label: 'Sending messages', status: 'complete' },
          { label: 'Updating delivery status', status: 'complete' },
        ],
      });

      setTimeout(() => {
        closeProgress();
        showPopup({ type: 'success', message: 'Communication sent successfully. Check logs for delivery outcomes.' });
      }, 550);
    } catch (error) {
      updateProgress({
        steps: [
          { label: 'Validating recipients', status: 'complete' },
          { label: 'Preparing communication', status: 'complete' },
          { label: 'Sending messages', status: 'error' },
          { label: 'Updating delivery status', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to send communication.' });
    } finally {
      setIsSending(false);
    }
  };

  const previewTemplate = async (template: EmailTemplateRecord) => {
    handleSelectTemplate(template);
    setIsPreviewing(true);
    try {
      const response = await previewEmail({
        registrationId: undefined,
        recipientEmail: 'preview@example.com',
        recipientName: 'Preview user',
        emailType: template.type,
        subject: subject || template.subject,
        message,
      });
      setPreviewHtml(response.html);
    } finally {
      setIsPreviewing(false);
    }
  };

  const filterRecipients = useMemo(() => {
    return recipients.filter((registration) => {
      if (audienceMode === 'pending') {
        return registration.paymentStatus === 'Pending';
      }
      if (audienceMode === 'paid') {
        return registration.paymentStatus === 'Paid';
      }
      if (audienceMode === 'ieee') {
        return registration.ieeeMember;
      }
      if (audienceMode === 'country') {
        return registration.country === selectedCountryFilter;
      }
      if (audienceMode === 'participantType') {
        return registration.participantType === selectedParticipantTypeFilter;
      }
      return true;
    });
  }, [recipients, audienceMode, selectedCountryFilter, selectedParticipantTypeFilter]);

  const toggleRecipientSelection = (registrationId: string) => {
    setSelectedRecipientIds((current) =>
      current.includes(registrationId)
        ? current.filter((id) => id !== registrationId)
        : [...current, registrationId],
    );
  };

  const addManualRecipient = () => {
    const email = manualRecipientEmail.trim();
    const fullName = manualRecipientName.trim();
    if (!email || !fullName) {
      showPopup({ type: 'error', message: 'Provide name and email for manual recipients.' });
      return;
    }
    setManualRecipients((current) => [...current, { email, fullName }]);
    setManualRecipientEmail('');
    setManualRecipientName('');
  };

  const removeManualRecipient = (email: string) => {
    setManualRecipients((current) => current.filter((recipient) => recipient.email !== email));
  };

  const removeSelectedRecipient = (registrationId: string) => {
    setSelectedRecipientIds((current) => current.filter((id) => id !== registrationId));
  };

  const sentCount = logs.filter((log) => log.status === 'sent').length;
  const failedCount = logs.filter((log) => log.status === 'failed').length;
  const deliveryRate = logs.length ? Math.round((sentCount / logs.length) * 1000) / 10 : 0;
  const openedCount = logs.filter((log) => Boolean(log.opened_at)).length;
  const clickedCount = logs.filter((log) => Boolean(log.clicked_at)).length;
  const openRate = sentCount ? Math.round((openedCount / sentCount) * 1000) / 10 : 0;
  const audienceCount = selectedRecipientIds.length + manualRecipients.length;
  const campaignRows = useMemo(() => logs.slice(0, 5), [logs]);
  const activityTimeline = useMemo(() => logs.slice(0, 4).map((log) => ({ time: formatDate(log.sent_at ?? log.created_at), event: log.status === 'sent' ? 'Communication sent' : `Delivery ${log.status}`, detail: log.subject || log.email_type })), [logs]);
  const insertVariable = (variable: string) => setMessage((current) => `${current}${current ? ' ' : ''}{{${variable}}}`);
  const navigate = (path: string) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };

  return (
    <div className="command-shell">
      <aside className="command-sidebar">
        <button className="command-brand" onClick={() => navigate('/admin')}><span>IEEE</span><strong>EA-HTS</strong></button>
        <p className="command-event">SUMMIT 2027</p>
        <nav className="command-nav" aria-label="Admin navigation">
          <button className="command-nav-item" onClick={() => navigate('/admin')}><LayoutDashboard size={18} /> Dashboard</button>
          <button className="command-nav-item" onClick={() => navigate('/admin/participants')}><Users size={18} /> Participants</button>
          <button className="command-nav-item active"><Mail size={18} /> Communications</button>
          <button className="command-nav-item" onClick={() => navigate('/admin/partners')}><Globe2 size={18} /> Partners</button>
          <button className="command-nav-item" onClick={() => navigate('/admin/program')}><Sparkles size={18} /> Program</button>
          <button className="command-nav-item" onClick={() => navigate('/admin/finance')}><CircleDollarSign size={18} /> Finance</button>
          <button className="command-nav-item" onClick={() => navigate('/admin/operations')}><Activity size={18} /> Operations</button>
        </nav>
        <div className="command-sidebar-bottom"><button className="command-nav-item muted" onClick={() => navigate('/admin/settings')}><Settings size={18} /> Settings</button><button className="command-nav-item" onClick={() => { clearAdminSession(); window.location.reload(); }}><LogOut size={18} /> Sign out</button></div>
      </aside>
      <main className="command-main">
      <div className="admin-shell communication-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow admin-eyebrow">EA-HTS SUMMIT COMMAND CENTER · COMMUNICATIONS</p>
          <h1>Communication command center</h1>
          <p className="communications-intro">Create, manage, and monitor all summit communications from one workspace.</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={onReturn}>
          <ArrowLeft className="btn-icon" /> Back to dashboard
        </button>
      </header>

      <section className="communications-hero">
        <div>
          <p className="eyebrow admin-eyebrow">COMMUNICATION COMMAND CENTER</p>
          <h2>Manage summit emails, announcements, and participant reach</h2>
        </div>
        <button type="button" className="btn btn-primary btn-xl" onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <Send className="btn-icon" /> New Communication
        </button>
      </section>

      <section className="communication-health">
        <article className="stat-card">
          <span>Emails sent</span>
          <strong>{sentCount}</strong>
          <small>Tracked delivery activity</small>
        </article>
        <article className="stat-card">
          <span>Delivery rate</span>
          <strong>{deliveryRate}%</strong>
          <small className="health-good">Healthy delivery</small>
        </article>
        <article className="stat-card">
          <span>Open rate</span>
          <strong>{openRate}%</strong>
          <small>{openedCount} opens tracked</small>
        </article>
        <article className="stat-card">
          <span>Failed</span>
          <strong>{failedCount}</strong>
          <small className={failedCount ? 'health-warn' : 'health-good'}>{failedCount ? 'Needs review' : 'No failures'}</small>
        </article>
      </section>

      <section className="campaign-activity-grid">
        <div className="campaign-history-panel">
          <div className="panel-header">
            <p className="eyebrow admin-eyebrow">CAMPAIGN HISTORY</p>
            <h3>Live campaign tracking</h3>
          </div>
          <div className="campaign-table-wrap"><table className="campaign-table"><thead><tr><th>Campaign</th><th>Status</th><th>Recipient</th><th>Sent</th><th /></tr></thead><tbody>{campaignRows.length === 0 ? <tr><td colSpan={5} className="campaign-empty">No communications have been sent yet.</td></tr> : campaignRows.map((campaign) => <tr key={campaign.id}><td><strong>{campaign.subject || campaign.email_type}</strong><small>{campaign.email_type}</small></td><td><span className={`campaign-status ${campaign.status}`}>{campaign.status}</span></td><td>{campaign.recipient_name ?? campaign.recipient_email ?? 'Participant'}</td><td>{formatDate(campaign.sent_at ?? campaign.created_at)}</td><td><button className="campaign-view" onClick={() => setSelectedCampaign(campaign)}>View <BarChart3 size={13} /></button></td></tr>)}</tbody></table></div>
        </div>

        <div className="communication-activity-panel">
          <div className="panel-header">
            <p className="eyebrow admin-eyebrow">COMMUNICATION ACTIVITY</p>
            <h3>Recent operations</h3>
          </div>
          <div className="activity-feed">
            {activityTimeline.map((item) => (
              <div key={item.time + item.event} className="activity-item">
                <strong>{item.time}</strong>
                <div>
                  <p>{item.event}</p>
                  <small>{item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="communication-quick-actions">
        <button type="button" onClick={() => { handleSelectTemplate(manualTemplate); setSubject('Summit announcement from EA-HTS'); }}><span className="quick-action-icon"><Mail size={20} /></span><strong>New announcement</strong><small>Send an update to selected participants</small></button>
        <button type="button" onClick={() => { const match = displayedTemplates.find((item) => item.type === 'payment-reminder'); if (match) handleSelectTemplate(match); }}><span className="quick-action-icon orange"><WalletCards size={20} /></span><strong>Payment reminder</strong><small>Notify participants with pending payments</small></button>
        <button type="button" onClick={() => { const match = displayedTemplates.find((item) => item.type === 'registration-received'); if (match) handleSelectTemplate(match); }}><span className="quick-action-icon blue"><Ticket size={20} /></span><strong>Registration info</strong><small>Welcome and guide new attendees</small></button>
      </section>

      <section ref={composerRef} className="email-studio-grid">
        <aside className="library-panel">
          <div className="panel-header">
            <div>
                <h2>Email templates</h2>
              <p className="panel-subtitle">Choose a starting point or write a new message.</p>
            </div>
          </div>

          <div className="panel-controls">
            <input
              className="search-box"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search templates..."
            />
          </div>

          <div className="category-list">
            <button type="button" className={category === 'all' ? 'category-pill active' : 'category-pill'} onClick={() => setCategory('all')}>
              All categories
            </button>
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                className={category === item.value ? 'category-pill active' : 'category-pill'}
                onClick={() => setCategory(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="template-cards">
            {filteredTemplates.length === 0 ? (
              <div className="empty">No templates match this filter.</div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={template.id === selectedTemplateId ? 'template-card selected' : 'template-card'}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="template-card-header">
                    <h3>{template.name}</h3>
                    <span className={`status-chip status-${template.status}`}>{template.status}</span>
                  </div>
                  <div className="template-card-meta">
                    <span>{template.category}</span>
                    <span>{template.audience}</span>
                    <span>{template.trigger}</span>
                  </div>
                  <div className="template-card-actions">
                    <button type="button" className="btn btn-ghost" onClick={(event) => { event.stopPropagation(); void previewTemplate(template); }}>
                      Preview
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={(event) => { event.stopPropagation(); handleSelectTemplate(template); composerRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
                      Use
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="detail-panel">
          <div className="detail-header">
            <div>
                  <p className="eyebrow admin-eyebrow">NEW COMMUNICATION</p>
                  <h2>{selectedTemplateRecord?.name ?? 'Compose communication'}</h2>
            </div>
            <div className="detail-actions">
              <button type="button" className="btn btn-outline" onClick={() => {
                setCategory('all');
                setSearch('');
                setEmailType('all');
                setStatus('all');
                setPage(1);
              }}>
                <FileText className="btn-icon" /> Reset filters
              </button>
            </div>
          </div>

          {selectedTemplateRecord ? (
            <>
              <div className={`composer-stepper step-${composerStep}`} aria-label="Communication composer steps">
                <div className="composer-stepper-header"><span className={composerStep === 0 ? 'active' : 'complete'}><b>1</b> Audience</span><i /><span className={composerStep === 1 ? 'active' : composerStep > 1 ? 'complete' : ''}><b>2</b> Message</span><i /><span className={composerStep === 2 ? 'active' : ''}><b>3</b> Preview & send</span></div>
              <div className="composer-shell">
                <aside className="composer-audience-panel">
                  <div className="panel-header">
                    <p className="eyebrow admin-eyebrow">Audience</p>
                    <h3>Target recipients</h3>
                    <p className="panel-note"><strong className="animated-recipient-count">{filterRecipients.length}</strong> matches · <strong className="animated-recipient-count">{audienceCount}</strong> selected</p>
                  </div>

                  <div className="audience-stats">
                    <span>{filterRecipients.length} matched</span>
                    <span>{selectedRecipientIds.length} selected</span>
                    <span>{manualRecipients.length} manual</span>
                  </div>

                  <div className="detail-card">
                    <h4>Search & filter</h4>
                    <label className="field">
                      <span>Search registrations</span>
                      <input value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} placeholder="Search by name, email or org" />
                    </label>
                    <div className="recipient-filter-panel">
                      <div className="audience-pills">
                        <button type="button" className={audienceMode === 'everyone' ? 'audience-pill active' : 'audience-pill'} onClick={() => setAudienceMode('everyone')}>Everyone</button>
                        <button type="button" className={audienceMode === 'pending' ? 'audience-pill active' : 'audience-pill'} onClick={() => setAudienceMode('pending')}>Payment pending</button>
                        <button type="button" className={audienceMode === 'paid' ? 'audience-pill active' : 'audience-pill'} onClick={() => setAudienceMode('paid')}>Paid</button>
                        <button type="button" className={audienceMode === 'ieee' ? 'audience-pill active' : 'audience-pill'} onClick={() => setAudienceMode('ieee')}>IEEE members</button>
                        <button type="button" className={audienceMode === 'country' ? 'audience-pill active' : 'audience-pill'} onClick={() => setAudienceMode('country')}>Country</button>
                        <button type="button" className={audienceMode === 'participantType' ? 'audience-pill active' : 'audience-pill'} onClick={() => setAudienceMode('participantType')}>Participant type</button>
                      </div>
                      <div className="audience-details">
                        {audienceMode === 'country' && (
                          <select value={selectedCountryFilter} onChange={(event) => setSelectedCountryFilter(event.target.value)}>
                            <option value="Rwanda">Rwanda</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Tanzania">Tanzania</option>
                          </select>
                        )}
                        {audienceMode === 'participantType' && (
                          <select value={selectedParticipantTypeFilter} onChange={(event) => setSelectedParticipantTypeFilter(event.target.value)}>
                            <option value="Student">Student</option>
                            <option value="Professional">Professional</option>
                            <option value="Speaker">Speaker</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="detail-card recipient-board">
                    <h4>Quick audience preview</h4>
                    <div className="recipient-list">
                      {filterRecipients.length === 0 ? (
                        <div className="empty">No matching registrations found.</div>
                      ) : (
                        filterRecipients.slice(0, 8).map((registration) => (
                          <button
                            key={registration.id}
                            type="button"
                            className={selectedRecipientIds.includes(registration.id) ? 'recipient-item selected' : 'recipient-item'}
                            onClick={() => toggleRecipientSelection(registration.id)}
                          >
                            <div>
                              <strong>{registration.fullName}</strong>
                              <small>{registration.email}</small>
                            </div>
                            <span className={`status-badge status-${registration.paymentStatus.toLowerCase()}`}>{registration.paymentStatus}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="detail-card">
                    <h4>Actions</h4>
                    <button type="button" className="btn btn-secondary" onClick={() => { setSelectedRecipientIds([]); setManualRecipients([]); }}>Clear selections</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setRecipientSearch('')}>Reset filters</button>
                    <button type="button" className="btn btn-primary composer-next" onClick={() => setComposerStep(1)}>Continue to message <Send className="btn-icon" /></button>
                  </div>
                </aside>

                <section className="composer-editor-panel">
                  <div className="panel-header">
                    <p className="eyebrow admin-eyebrow">Composer</p>
                    <h3>{selectedTemplateRecord.name}</h3>
                    <p className="panel-note">{selectedTemplateRecord.preview_text}</p>
                  </div>

                  <div className="composer-toolbar">
                    <div className="composer-toolbar-chips">
                      <span className="chip">Audience: {selectedTemplateRecord.audience}</span>
                      <span className="chip">Trigger: {selectedTemplateRecord.trigger}</span>
                      <span className="chip">Status: {selectedTemplateRecord.status}</span>
                    </div>
                    <div className="composer-toolbar-actions">
                      <button type="button" className="btn btn-ghost" onClick={() => insertVariable('name')}>Insert variable</button>
                      <button type="button" className="btn btn-ghost" onClick={() => { localStorage.setItem('eahts-email-draft', JSON.stringify({ subject, message, selectedTemplateId })); showPopup({ type: 'success', message: 'Draft saved in this browser.' }); }}>Save draft</button>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="composer-identity-row"><span className="composer-sender-mark">E</span><span><small>FROM</small><strong>EA-HTS Summit Secretariat</strong><em>via Brevo</em></span><span className="draft-state">Draft ready</span></div>
                    <label className="field">
                      <span>Choose template</span>
                      <select className="composer-template-select" value={selectedTemplateId ?? ''} onChange={(event) => { const template = displayedTemplates.find((item) => item.id === event.target.value); if (template) handleSelectTemplate(template); }}>
                        {displayedTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                      </select>
                    </label>
                    <div className="editor-format-toolbar" aria-label="Email formatting tools"><button type="button" title="Bold" onClick={() => setMessage((current) => `${current}**bold text**`)}><Bold size={14} /></button><button type="button" title="Italic" onClick={() => setMessage((current) => `${current}_italic text_`)}><Italic size={14} /></button><button type="button" title="Insert link" onClick={() => setMessage((current) => `${current}[Link text](https://)`)}><Link2 size={14} /></button>{selectedTemplateRecord.variables.map((variable) => <button key={variable} type="button" className="variable-token" onClick={() => insertVariable(variable)}>{`{{${variable}}}`}</button>)}</div>
                    <label className="field">
                      <span>Subject</span>
                      <input value={subject} onChange={(event) => setSubject(event.target.value)} />
                    </label>
                    <label className="field">
                      <span>Message body</span>
                      <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Start writing your summit communication…" rows={20} />
                    </label>
                  </div>

                  <div className="detail-card detail-footer-card">
                    <div className="detail-actions-row">
                      <button type="button" className="btn btn-outline" onClick={() => setComposerStep(0)}>Back</button>
                      <button type="button" className="btn btn-primary" onClick={async () => { await onPreview(); setComposerStep(2); }} disabled={isPreviewing}><Sparkles className="btn-icon" /> {isPreviewing ? 'Preparing…' : 'Continue to preview'}</button>
                    </div>
                  </div>
                </section>

                <aside className="composer-preview-panel">
                  <div className="preview-header">
                    <p className="eyebrow admin-eyebrow">Preview</p>
                    <span>{audienceCount || 'No'} recipients</span>
                  </div>
                  <div className="preview-frame" dangerouslySetInnerHTML={{ __html: previewHtml || `<div style="padding:24px;font-family:Inter,sans-serif"><strong>${subject || selectedTemplateRecord.subject}</strong><p style="margin-top:16px;color:#57657f">Dear Participant,</p><p style="margin-top:12px;color:#334155">${message || selectedTemplateRecord.preview_text}</p></div>` }} />
                  <div className="preview-send-actions"><button type="button" className="btn btn-outline" onClick={() => setComposerStep(1)}>Back to edit</button><button type="button" className="btn btn-secondary" onClick={() => setConfirmSend(true)} disabled={isSending}><Send className="btn-icon" /> {isSending ? 'Sending…' : 'Send communication'}</button></div>
                </aside>
              </div>
              </div>
            </>
          ) : (
            <div className="empty">Select a template to review details and preview output.</div>
          )}

          <div className="email-log-panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow admin-eyebrow">Email log</p>
                <h2>Delivery audit</h2>
              </div>
            </div>

            <div className="filter-row">
              <input className="search-box" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search email, subject, or recipient" />
              <select value={status} onChange={(event) => { setStatus(event.target.value as 'all' | 'queued' | 'sent' | 'failed'); setPage(1); }}>
                <option value="all">All statuses</option>
                <option value="sent">Sent</option>
                <option value="queued">Queued</option>
                <option value="failed">Failed</option>
              </select>
              <select value={emailType} onChange={(event) => { setEmailType(event.target.value as EmailType | 'all'); setPage(1); }}>
                <option value="all">All triggers</option>
                {emailTypes.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="participant-list">
              {logs.length === 0 ? (
                <div className="empty">No logs found</div>
              ) : (
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Sent at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.recipient_name ?? log.recipient_email ?? 'Unknown'}</td>
                        <td>{log.email_type}</td>
                        <td>{log.subject}</td>
                        <td>{log.status}</td>
                        <td>{formatDate(log.sent_at ?? log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pagination-row">
              <div>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</div>
              <div>
                <button className="btn btn-outline" type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
                <button className="btn btn-outline" type="button" onClick={() => setPage(page + 1)} disabled={page * limit >= total}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ConfirmModal open={confirmSend} title="Send communication?" description={`${audienceCount || 'Selected'} recipients will receive “${subject || selectedTemplateRecord?.subject || 'your message'}”.`} confirmLabel="Send now" onCancel={() => setConfirmSend(false)} onConfirm={() => { setConfirmSend(false); void onSendBulk(); }} />
      {selectedCampaign && <aside className="campaign-analytics-drawer" role="dialog" aria-label="Campaign analytics"><button className="drawer-close" onClick={() => setSelectedCampaign(null)}><X size={18} /></button><p className="eyebrow">CAMPAIGN ANALYTICS</p><h2>{selectedCampaign.subject || selectedCampaign.email_type}</h2><p className="campaign-drawer-recipient">{selectedCampaign.recipient_name ?? selectedCampaign.recipient_email ?? 'Recipient details unavailable'}</p><div className="analytics-grid"><div><span>Delivered</span><strong>{selectedCampaign.status === 'sent' ? '1' : '0'}</strong></div><div><span>Opened</span><strong>{selectedCampaign.opened_at ? '1' : '0'}</strong></div><div><span>Clicked</span><strong>{selectedCampaign.clicked_at ? '1' : '0'}</strong></div><div><span>Failed</span><strong>{selectedCampaign.status === 'failed' ? '1' : '0'}</strong></div></div><div className="analytics-bars"><div><span>Delivery</span><i style={{ width: `${selectedCampaign.status === 'sent' ? 100 : 0}%` }} /></div><div><span>Open</span><i style={{ width: `${selectedCampaign.opened_at ? 100 : 0}%` }} /></div><div><span>Click</span><i style={{ width: `${selectedCampaign.clicked_at ? 100 : 0}%` }} /></div></div><div className="analytics-note"><strong>Status</strong><p>{selectedCampaign.status}</p><strong>Sent</strong><p>{formatDate(selectedCampaign.sent_at ?? selectedCampaign.created_at)}</p></div></aside>}
      </div>
      </main>
    </div>
  );
}
