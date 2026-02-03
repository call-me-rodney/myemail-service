// client/src/components/EmailDetail.tsx
import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, IconButton, Button } from '@mui/material';
import type { Conversation, Email } from '../types/interfaces';
import { format, parseISO } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplyIcon from '@mui/icons-material/Reply';
import ComposeModal from './ComposeModal';

interface EmailDetailProps {
  conversation: Conversation;
  onClose: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ conversation, onClose }) => {
  const [replyModalOpen, setReplyModalOpen] = useState(false);

  // Get the latest email in the conversation for reply context
  const latestEmail = conversation.emails[conversation.emails.length - 1];

  const handleReplyClick = () => {
    setReplyModalOpen(true);
  };

  const handleReplySuccess = () => {
    setReplyModalOpen(false);
  };
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          {conversation.subject}
        </Typography>
        <Button
          startIcon={<ReplyIcon />}
          variant="contained"
          color="primary"
          onClick={handleReplyClick}
          size="small"
        >
          Reply
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
          </Paper>
        ))}
      </Box>

      {/* Reply Modal */}
      <ComposeModal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        onSendSuccess={handleReplySuccess}
        conversationId={conversation.id}
        replyToEmail={latestEmail?.from_email}
        replySubject={conversation.subject}
      />
    </Box>
  );
};

export default EmailDetail;
