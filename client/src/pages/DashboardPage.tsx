// client/src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import type { DashboardSection } from '../components/Layout';
import EmailsPanel from '../components/EmailsPanel';
import SettingsPanel from '../components/SettingsPanel';

const DashboardPage: React.FC = () => {
  const [section, setSection] = useState<DashboardSection>('emails');

  return (
    <Layout activeSection={section} onSectionChange={setSection}>
      {section === 'emails' && <EmailsPanel />}
      {section === 'settings' && <SettingsPanel />}
    </Layout>
  );
};

export default DashboardPage;