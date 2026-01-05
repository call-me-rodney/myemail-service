// client/src/components/EmailDetail.tsx
import React from 'react';
import { Box, Typography, Paper, Divider, IconButton } from '@mui/material';
import type { Conversation, Email } from '../types/interfaces';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface EmailDetailProps {
  conversation: Conversation;
  onClose: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ conversation, onClose }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          {conversation.subject}
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {conversation.emails.map((email: Email) => (
        <Paper key={email.id} elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              From: {email.from_name || email.from_email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(parseISO(email.created_at), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            To: {email.recipients?.filter(r => r.recipient_type === 'to').map(r => r.recipient_name || r.recipient_email).join(', ')}
          </Typography>
          {email.recipients?.some(r => r.recipient_type === 'cc') && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Cc: {email.recipients?.filter(r => r.recipient_type === 'cc').map(r => r.recipient_name || r.recipient_email).join(', ')}
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {email.textcontent}
          </Typography>
          {/* Potentially render html_content if available, though textcontent is used for simplicity here */}
          {/* {email.html_content && (
            <div dangerouslySetInnerHTML={{ __html: email.html_content }} />
          )} */}
        </Paper>
      ))}
    </Box>
  );
};

export default EmailDetail;

// Helper to parse ISO strings, also used in EmailPreview
function parseISO(dateString: string): Date {
  return new Date(dateString);
}
