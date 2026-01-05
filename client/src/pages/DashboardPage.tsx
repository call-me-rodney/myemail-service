// client/src/pages/DashboardPage.tsx
import React from 'react';
import Layout from '../components/Layout';
import MailList from '../components/MailList'; // Import MailList

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <MailList />
    </Layout>
  );
};

export default DashboardPage;