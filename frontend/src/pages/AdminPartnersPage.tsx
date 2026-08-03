import { useEffect, useState } from 'react';
import AuditTimeline from '../components/AuditTimeline';
import ConfirmModal from '../components/ConfirmModal';
import AdminWorkspaceLayout from '../layouts/AdminWorkspaceLayout';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePartners.length ? (
                  visiblePartners.map((partner) => (
                    <tr key={partner.id}>
                      <td>{partner.company}</td>
                      <td>{partner.category}</td>
                      <td>
                        {partner.contactPerson}
                        <br />
                        <small>{partner.email}</small>
                      </td>
                      <td>{partner.country || '—'}</td>
                      <td>{partner.status}</td>
                      <td>{partner.agreementStatus}</td>
                      <td>
                        <button className="text-button" onClick={() => openEdit(partner)}>Edit</button>
                        {partner.status === 'Pending' && (
                          <>
                            <button className="text-button" onClick={() => setConfirm({ kind: 'status', partner, status: 'Confirmed' })}>Approve</button>
                            <button className="text-button" onClick={() => setConfirm({ kind: 'status', partner, status: 'Rejected' })}>Reject</button>
                          </>
                        )}
                        <button className="text-button danger" onClick={() => setConfirm({ kind: 'delete', partner })}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No records match this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AuditTimeline />

      <ConfirmModal open={formOpen} title={editing ? 'Edit partner' : 'Add partner'} description="Enter the partner details before saving this record." confirmLabel="Review changes" onCancel={() => setFormOpen(false)} onConfirm={submit}>
        <div className="admin-form-grid">
          <input value={form.company} onChange={(event) => change('company', event.target.value)} placeholder="Company *" />
          <input value={form.category} onChange={(event) => change('category', event.target.value)} placeholder="Category *" />
          <input value={form.contactPerson} onChange={(event) => change('contactPerson', event.target.value)} placeholder="Contact person *" />
          <input type="email" value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="Email *" />
          <input value={form.phone} onChange={(event) => change('phone', event.target.value)} placeholder="Phone" />
          <input value={form.country} onChange={(event) => change('country', event.target.value)} placeholder="Country" />
          <select value={form.agreementStatus} onChange={(event) => change('agreementStatus', event.target.value)}>
            <option value="draft">Agreement: draft</option>
            <option value="sent">Agreement: sent</option>
            <option value="signed">Agreement: signed</option>
            <option value="expired">Agreement: expired</option>
          </select>
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
    </AdminWorkspaceLayout>
  );
}
