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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#fafafa' }}>
      {/* Email List Section */}
      <Box 
        sx={{ 
          width: selectedConversation ? '35%' : '100%', 
          overflowY: 'auto', 
          borderRight: selectedConversation ? '1px solid #e0e0e0' : 'none',
          backgroundColor: 'background.paper',
          transition: 'width 0.3s ease',
        }}
      >
        <List sx={{ p: 0 }}>
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

      {/* Email Detail Section */}
      {selectedConversation && (
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <EmailDetail 
            conversation={selectedConversation} 
            onClose={() => setSelectedConversation(null)} 
          />
        </Box>
      )}
    </Box>
  );
};

export default MailList;
