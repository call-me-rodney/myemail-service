// client/src/components/MailList.tsx
import React, { useState } from 'react';
import { Box, Typography, List, Divider, CircularProgress } from '@mui/material';
import useEmails from '../hooks/useEmails';
import EmailPreview from './EmailPreview';
import EmailDetail from './EmailDetail';
import type { Conversation } from '../types/interfaces';

const MailList: React.FC = () => {
  const { conversations, loading, error } = useEmails();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
        <Typography variant="body2">Please try again later.</Typography>
      </Box>
    );
  }

  if (!conversations.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="h6">No emails found.</Typography>
        <Typography variant="body2">Start by composing a new email!</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}> {/* Adjust height based on AppBar */}
      <Box sx={{ width: selectedConversation ? '30%' : '100%', overflowY: 'auto', borderRight: selectedConversation ? '1px solid #e0e0e0' : 'none' }}>
        <List>
          {conversations.map((conversation) => (
            <React.Fragment key={conversation.id}>
              <EmailPreview
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => setSelectedConversation(conversation)}
              />
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {selectedConversation && (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <EmailDetail conversation={selectedConversation} onClose={() => setSelectedConversation(null)} />
        </Box>
      )}
    </Box>
  );
};

export default MailList;
