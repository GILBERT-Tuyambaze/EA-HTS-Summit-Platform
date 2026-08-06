import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import AdminWorkspaceLayout from '../layouts/AdminWorkspaceLayout';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { countries } from '../data/countries';
import '../styles/admin.css';
import '../styles/admin-drawer.css';
import {
  createPartner,
  deletePartner,
  getPartners,
  updatePartner,
  updatePartnerStatus,
  type PartnerInput,
  type PartnerRecord,
  type PartnerStatus,
} from '../services/partnerService';

const blank: PartnerInput = {
  company: '',
  category: '',
  contactPerson: '',
  email: '',
  phone: '',
  country: '',
  status: 'Pending',
  agreementStatus: 'draft',
  logo: null,
  details: '',
};

type InquiryFilter = 'all' | 'Partnership Inquiry' | 'Side Event Proposal' | 'Startup Challenge Application';

const inquiryFilters: InquiryFilter[] = [
  'all',
  'Partnership Inquiry',
  'Side Event Proposal',
  'Startup Challenge Application',
];

const normalizeCategory = (value: string = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, partnerValue: 0 });
  const [form, setForm] = useState<PartnerInput>(blank);
  const [editing, setEditing] = useState<PartnerRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: 'save' | 'status' | 'delete'; partner?: PartnerRecord; status?: PartnerStatus } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<InquiryFilter>('all');
  const [selectedPartner, setSelectedPartner] = useState<PartnerRecord | null>(null);
  const [partnerAction, setPartnerAction] = useState<'view' | 'update' | 'approve' | 'reject'>('view');
  const [drawerForm, setDrawerForm] = useState<PartnerInput>(blank);
  const { showPopup } = usePopup();
  const { openProgress, closeProgress } = useProgress();

  const load = async () => {
    setLoading(true);
    try {
      const r = await getPartners();
      setPartners(r.partners);
      setStats(r.stats);
    } catch (error) {
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load partners.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visiblePartners = selectedFilter === 'all'
    ? partners
    : partners.filter((partner) => normalizeCategory(partner.category) === normalizeCategory(selectedFilter));

  const openNew = () => {
    setEditing(null);
    setForm(blank);
    setFormOpen(true);
  };

  const openEdit = (partner: PartnerRecord) => {
    setEditing(partner);
    setForm({ ...partner });
    setFormOpen(true);
  };

  const openPartnerDetails = (partner: PartnerRecord) => {
    setSelectedPartner(partner);
    setPartnerAction('view');
    setDrawerForm({ ...partner });
  };

  const closePartnerDetails = () => {
    setSelectedPartner(null);
  };

  const updateDrawerField = (key: keyof PartnerInput, value: string) => {
    setDrawerForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    if (!form.company || !form.category || !form.contactPerson || !form.email) {
      showPopup({ type: 'error', message: 'Complete the required partner information.' });
      return;
    }
    setConfirm({ kind: 'save', partner: editing ?? undefined });
  };

  const execute = async () => {
    if (!confirm) return;

    const isDelete = confirm.kind === 'delete';
    openProgress({
      title: isDelete ? 'Removing partner' : confirm.kind === 'status' ? 'Updating partner status' : 'Saving partner',
      description: 'Updating the database and creating an audit record.',
      steps: [{ label: 'Saving changes', status: 'active' }],
    });

    try {
      if (confirm.kind === 'save') {
        editing ? await updatePartner(editing.id, form) : await createPartner(form);
        setFormOpen(false);
      } else if (confirm.kind === 'status' && confirm.partner && confirm.status) {
        await updatePartnerStatus(confirm.partner.id, confirm.status);
      } else if (confirm.partner) {
        await deletePartner(confirm.partner.id);
      }

      await load();
      showPopup({
        type: 'success',
        message: isDelete ? 'Partner removed successfully.' : confirm.kind === 'status' ? 'Partner status updated successfully.' : 'Partner saved successfully.',
      });
    } catch (error) {
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to complete action.' });
    } finally {
      closeProgress();
      setConfirm(null);
    }
  };

  const change = (key: keyof PartnerInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <AdminWorkspaceLayout title="Partners" description="Manage partner records, agreements, and approvals.">
      <section className="metric-grid finance-metrics">
        {[['Total partners', stats.total], ['Confirmed', stats.confirmed], ['Pending', stats.pending], ['Partner value', stats.partnerValue]].map(([label, value]) => (
          <article className="metric-card" key={String(label)}>
            <span>{label}</span>
            <strong>{typeof value === 'number' && String(label) === 'Partner value' ? `$${value}` : value}</strong>
          </article>
        ))}
      </section>

      <section className="command-workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">PARTNER DIRECTORY</p>
            <h2>Partner roster</h2>
          </div>
          <button className="btn btn-primary" onClick={openNew}>Add partner</button>
        </div>

        <div className="workspace-filter-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0 0 1rem' }}>
          {inquiryFilters.map((filter) => {
            const label = filter === 'all' ? 'All submissions' : filter;
            const isActive = selectedFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setSelectedFilter(filter)}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="workspace-loading">Loading partner records</div>
        ) : (
          <div className="finance-table-wrap">
            <div className="workspace-subheader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
              <p style={{ margin: 0, color: '#5b708c' }}>
                {selectedFilter === 'all' ? 'Showing all submissions' : `Showing ${selectedFilter} submissions`}
              </p>
              <span style={{ fontWeight: 700, color: '#003366' }}>{visiblePartners.length} item(s)</span>
            </div>
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Contact</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th>Agreement</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePartners.length ? (
                  visiblePartners.map((partner) => (
                    <tr key={partner.id} onClick={() => openPartnerDetails(partner)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {partner.logo ? (
                            <img src={partner.logo} alt={`${partner.company} logo`} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, background: '#fff', border: '1px solid #e5e9f0' }} />
                          ) : (
                            <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 8, background: '#f3f6fa', color: '#3b4b63', fontWeight: 700 }}>{partner.company.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</div>
                          )}
                          <span>{partner.company}</span>
                        </div>
                      </td>
                      <td>{partner.category}</td>
                      <td>
                        {partner.contactPerson}
                        <br />
                        <small>{partner.email}</small>
                      </td>
                      <td>{partner.country || '—'}</td>
                      <td>{partner.status}</td>
                      <td>{partner.agreementStatus}</td>
                      <td>{partner.details ? `${partner.details.slice(0, 80)}${partner.details.length > 80 ? '…' : ''}` : '—'}</td>
                      <td>
                        <button className="text-button" onClick={(event) => { event.stopPropagation(); openEdit(partner); }}>Edit</button>
                        {partner.status === 'Pending' && (
                          <>
                            <button className="text-button" onClick={(event) => { event.stopPropagation(); setConfirm({ kind: 'status', partner, status: 'Confirmed' }); }}>Approve</button>
                            <button className="text-button" onClick={(event) => { event.stopPropagation(); setConfirm({ kind: 'status', partner, status: 'Rejected' }); }}>Reject</button>
                          </>
                        )}
                        <button className="text-button danger" onClick={(event) => { event.stopPropagation(); setConfirm({ kind: 'delete', partner }); }}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>No records match this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal className="partner-form-modal" open={formOpen} title={editing ? 'Edit partner' : 'Add partner'} description="Enter the partner details before saving this record." confirmLabel="Review changes" onCancel={() => setFormOpen(false)} onConfirm={submit}>
        <div className="partner-form-shell">
          <label className="partner-form-field partner-form-field-full">
            <span>Company Name *</span>
            <input value={form.company} onChange={(event) => change('company', event.target.value)} placeholder="Enter company name" />
          </label>

          <div className="partner-form-grid">
            <label className="partner-form-field">
              <span>Category *</span>
              <select value={form.category} onChange={(event) => change('category', event.target.value)}>
                <option value="">Select category</option>
                <option value="Partnership Inquiry">Our Partners</option>
                <option value="Side Event Proposal">Side Event Proposal</option>
                <option value="Startup Challenge Application">Startup Challenge Application</option>
              </select>
            </label>
            <label className="partner-form-field">
              <span>Contact Person</span>
              <input value={form.contactPerson} onChange={(event) => change('contactPerson', event.target.value)} placeholder="Enter contact person's name" />
            </label>
            <label className="partner-form-field">
              <span>Email Address *</span>
              <input type="email" value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="example@email.com" />
            </label>
            <label className="partner-form-field">
              <span>Phone Number</span>
              <input value={form.phone} onChange={(event) => change('phone', event.target.value)} placeholder="+94 77 123 4567" />
            </label>
            <label className="partner-form-field">
              <span>Logo URL</span>
              <input value={form.logo ?? ''} onChange={(event) => change('logo', event.target.value)} placeholder="https://example.com/logo.png" />
            </label>
            <label className="partner-form-field">
              <span>Country</span>
              <select value={form.country} onChange={(event) => change('country', event.target.value)}>
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </label>
            <label className="partner-form-field">
              <span>Agreement Type</span>
              <select value={form.agreementStatus} onChange={(event) => change('agreementStatus', event.target.value)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="signed">Signed</option>
                <option value="expired">Expired</option>
              </select>
            </label>
          </div>
          <label className="partner-form-field partner-form-field-full">
            <span>Description</span>
            <textarea value={form.details || ''} onChange={(event) => change('details', event.target.value)} placeholder="Enter partner inquiry details, proposal summary, or additional remarks" />
          </label>
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.kind === 'delete' ? 'Delete partner?' : confirm?.kind === 'status' ? `${confirm.status} partner?` : 'Save partner?'}
        description={
          confirm?.kind === 'delete'
            ? 'This permanently removes the partner record.'
            : confirm?.kind === 'status'
              ? 'This changes the partner approval status.'
              : 'This creates or updates the partner record.'
        }
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : confirm?.kind === 'status' ? 'Confirm' : 'Save'}
        destructive={confirm?.kind === 'delete'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void execute()}
      />

      {selectedPartner && (
        <>
          <div className="drawer-overlay" onClick={closePartnerDetails} />
          <aside className="detail-drawer open" role="dialog" aria-label="Partner details">
            <button className="drawer-close" onClick={closePartnerDetails} aria-label="Close details">✕</button>
            <div className="detail-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {selectedPartner.logo ? (
                    <img src={selectedPartner.logo} alt={`${selectedPartner.company} logo`} style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 14, background: '#fff', border: '1px solid #e8edf4' }} />
                  ) : (
                    <div style={{ width: 60, height: 60, display: 'grid', placeItems: 'center', borderRadius: 20, background: '#eef4fb', color: '#1f3b5f', fontWeight: 800 }}>{selectedPartner.company.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</div>
                  )}
                  <div>
                    <p className="eyebrow admin-eyebrow">Partner snapshot</p>
                    <h2>{selectedPartner.company}</h2>
                    <p style={{ marginTop: 8, color: '#6b778c' }}>{selectedPartner.category} · {selectedPartner.status}</p>
                  </div>
                </div>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <h3>Contact information</h3>
                <ul>
                  <li><strong>Contact person:</strong> {selectedPartner.contactPerson}</li>
                  <li><strong>Email:</strong> {selectedPartner.email}</li>
                  <li><strong>Phone:</strong> {selectedPartner.phone || '—'}</li>
                  <li><strong>Country:</strong> {selectedPartner.country || '—'}</li>
                </ul>
              </div>

              <div className="detail-card">
                <h3>Agreement details</h3>
                <ul>
                  <li><strong>Status:</strong> {selectedPartner.status}</li>
                  <li><strong>Agreement type:</strong> {selectedPartner.agreementStatus}</li>
                </ul>
              </div>

              <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
                <h3>Inquiry details</h3>
                <p style={{ color: '#333', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedPartner.details || 'No additional details were provided for this submission.'}
                </p>
              </div>

              <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
                <h3>Admin review</h3>
                <label className="field" style={{ marginBottom: '1rem' }}>
                  <span>Change type</span>
                  <select value={partnerAction} onChange={(event) => setPartnerAction(event.target.value as typeof partnerAction)}>
                    <option value="view">View only</option>
                    <option value="update">Update details</option>
                    <option value="approve">Approve partner</option>
                    <option value="reject">Reject partner</option>
                  </select>
                </label>

                {partnerAction === 'update' ? (
                  <div className="partner-form-grid">
                    <label className="partner-form-field partner-form-field-full">
                      <span>Company</span>
                      <input value={drawerForm.company} onChange={(event) => updateDrawerField('company', event.target.value)} />
                    </label>
                    <label className="partner-form-field">
                      <span>Category</span>
                      <input value={drawerForm.category} onChange={(event) => updateDrawerField('category', event.target.value)} />
                    </label>
                    <label className="partner-form-field">
                      <span>Contact person</span>
                      <input value={drawerForm.contactPerson} onChange={(event) => updateDrawerField('contactPerson', event.target.value)} />
                    </label>
                    <label className="partner-form-field">
                      <span>Email</span>
                      <input type="email" value={drawerForm.email} onChange={(event) => updateDrawerField('email', event.target.value)} />
                    </label>
                    <label className="partner-form-field">
                      <span>Phone</span>
                      <input value={drawerForm.phone} onChange={(event) => updateDrawerField('phone', event.target.value)} />
                    </label>
                    <label className="partner-form-field">
                      <span>Logo URL</span>
                      <input value={drawerForm.logo ?? ''} onChange={(event) => updateDrawerField('logo', event.target.value)} placeholder="https://example.com/logo.png" />
                    </label>
                    <label className="partner-form-field">
                      <span>Country</span>
                      <input value={drawerForm.country} onChange={(event) => updateDrawerField('country', event.target.value)} />
                    </label>
                  </div>
                ) : partnerAction === 'approve' ? (
                  <p style={{ color: '#0c5a10' }}>Approve this partner record to move it into confirmed status after verifying details.</p>
                ) : partnerAction === 'reject' ? (
                  <p style={{ color: '#8f1d20' }}>Reject this partner record if the submission is not suitable.</p>
                ) : (
                  <p style={{ color: '#6b778c' }}>Review the partner information and choose an action before moving forward.</p>
                )}

                <div className="management-actions" style={{ marginTop: '1rem', gap: '0.75rem' }}>
                  {partnerAction === 'update' ? (
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (!drawerForm.company || !drawerForm.category || !drawerForm.contactPerson || !drawerForm.email) {
                        showPopup({ type: 'error', message: 'Complete the required partner information before saving.' });
                        return;
                      }
                      setForm(drawerForm);
                      setEditing(selectedPartner);
                      setFormOpen(true);
                      closePartnerDetails();
                    }}>
                      Save edits
                    </button>
                  ) : null}

                  {partnerAction === 'approve' ? (
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (selectedPartner) {
                        setConfirm({ kind: 'status', partner: selectedPartner, status: 'Confirmed' });
                        closePartnerDetails();
                      }
                    }}>
                      Confirm approval
                    </button>
                  ) : null}

                  {partnerAction === 'reject' ? (
                    <button type="button" className="btn btn-outline" onClick={() => {
                      if (selectedPartner) {
                        setConfirm({ kind: 'status', partner: selectedPartner, status: 'Rejected' });
                        closePartnerDetails();
                      }
                    }}>
                      Confirm rejection
                    </button>
                  ) : null}

                  <button type="button" className="btn btn-outline" onClick={closePartnerDetails}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </AdminWorkspaceLayout>
  );
}
