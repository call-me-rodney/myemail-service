// client/src/components/EmailPreview.tsx
import React from 'react';
import { ListItem, ListItemText, Typography, Box } from '@mui/material';
import type { Conversation } from '../types/interfaces';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface EmailPreviewProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ conversation, isSelected, onClick }) => {
  // Get the latest email in the conversation for preview details
  const latestEmail = conversation.emails[conversation.emails.length - 1];

  if (!latestEmail) {
    return null; // Should not happen if conversations are properly formed
  }

  const sender = latestEmail.from_name || latestEmail.from_email;
  const time = formatDistanceToNow(parseISO(latestEmail.created_at), { addSuffix: true });

  return (
    <ListItem
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        '&:hover': {
          backgroundColor: isSelected ? 'action.selected' : 'action.hover',
        },
        borderLeft: isSelected ? '4px solid' : 'none',
        borderLeftColor: isSelected ? 'primary.main' : 'transparent',
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
              {sender}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {time}
            </Typography>
          </Box>
        }
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}
            >
              {conversation.subject}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {latestEmail.textcontent}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default EmailPreview;
