// client/src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import type { DashboardSection } from '../components/Layout';
import EmailsPanel from '../components/EmailsPanel';
import MailingListsPanel from '../components/MailingListsPanel';
import SettingsPanel from '../components/SettingsPanel';

const DashboardPage: React.FC = () => {
  const [section, setSection] = useState<DashboardSection>('emails');

  return (
    <Layout activeSection={section} onSectionChange={setSection}>
      {section === 'emails' && <EmailsPanel />}
      {section === 'lists' && <MailingListsPanel />}
      {section === 'settings' && <SettingsPanel />}
    </Layout>
  );
};

export default DashboardPage;