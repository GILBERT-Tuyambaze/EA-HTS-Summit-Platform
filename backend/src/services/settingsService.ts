import { AppError } from '../lib/errors.js';

export type SettingsSection = {
  title: string;
  description: string;
};

export type RoleTemplate = {
  name: string;
  permissions: string[];
};

export async function getSettingsConfiguration() {
  return {
    sections: [
      { title: 'Event Settings', description: 'Date, venue and public event options.' },
      { title: 'Registration Settings', description: 'Participant form fields, payment rules and approval flow.' },
      { title: 'Email Settings', description: 'Communication templates, sender details and triggers.' },
      { title: 'Admin Users', description: 'Manage event administrators, credentials and access.' },
      { title: 'Roles & Permissions', description: 'Assign roles and control feature access for staff.' },
      { title: 'Security', description: 'Authentication, session limits and password policies.' },
      { title: 'Integrations', description: 'APIs, reports, sponsor tools and third-party services.' },
    ] as SettingsSection[],
    roles: [
      { name: 'Super Admin', permissions: ['View participants', 'Edit payments', 'Send emails', 'Manage program', 'Export data'] },
      { name: 'Finance Manager', permissions: ['View participants', 'Edit payments', 'Export data'] },
      { name: 'Registration Manager', permissions: ['View participants', 'Send emails', 'Manage program'] },
      { name: 'Communication Manager', permissions: ['Send emails', 'Export data'] },
      { name: 'Program Manager', permissions: ['Manage program', 'View participants'] },
    ] as RoleTemplate[],
  };
}
