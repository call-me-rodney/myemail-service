import React, { useState } from 'react';
import SystemAdminLayout from '../components/SystemAdminLayout';
import type { SystemAdminSection } from '../components/SystemAdminLayout';
import CreateCompanyPanel from '../components/CreateCompanyPanel';
import CompanyAdminRequestsPanel from '../components/CompanyAdminRequestsPanel';

const SystemAdminDashboardPage: React.FC = () => {
  const [section, setSection] = useState<SystemAdminSection>('create-company');

  return (
    <SystemAdminLayout activeSection={section} onSectionChange={setSection}>
      {section === 'create-company' && <CreateCompanyPanel />}
      {section === 'company-admins' && <CompanyAdminRequestsPanel />}
    </SystemAdminLayout>
  );
};

export default SystemAdminDashboardPage;
