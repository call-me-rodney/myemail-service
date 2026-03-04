import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import type { AdminDashboardSection } from '../components/AdminLayout';
import EmailsPanel from '../components/EmailsPanel';
import UserManagementPanel from '../components/UserManagementPanel';
import ComingSoonPanel from '../components/ComingSoonPanel';

const AdminDashboardPage: React.FC = () => {
  const [section, setSection] = useState<AdminDashboardSection>('emails');

  return (
    <AdminLayout activeSection={section} onSectionChange={setSection}>
      {section === 'emails' && <EmailsPanel />}
      {section === 'users' && <UserManagementPanel />}
      {section === 'templates' && <ComingSoonPanel title="Email Template Management" />}
      {section === 'lists' && <ComingSoonPanel title="Mailing List Management" />}
      {section === 'company' && <ComingSoonPanel title="Company Settings" />}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
