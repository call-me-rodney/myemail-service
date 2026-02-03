// client/src/components/ComposeModal.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Typography,
} from '@mui/material';
import type {SelectChangeEvent} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { EmailPriority, RecipientType, CreateEmailDto } from '../types/interfaces';
import { useAuth } from '../context/AuthContext';
import { sendEmail } from '../services/api';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSendSuccess: () => void;
  conversationId?: string; // Optional conversation ID for replies
  replyToEmail?: string; // Optional email to pre-fill as TO recipient for replies
  replySubject?: string; // Optional subject for replies
}

interface RecipientInput {
  email: string;
  name: string;
  type: RecipientType;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ open, onClose, onSendSuccess, conversationId, replyToEmail, replySubject }) => {
  const { userid, email } = useAuth();
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [textContent, setTextContent] = useState('');
  const [toEmail, setToEmail] = useState(''); // Direct TO email recipient
  const [priority, setPriority] = useState<EmailPriority>('normal');
  const [recipients, setRecipients] = useState<RecipientInput[]>([]);
  const [currentRecipientEmail, setCurrentRecipientEmail] = useState('');
  const [currentRecipientType, setCurrentRecipientType] = useState<RecipientType>('to');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill fromEmail when email is available from auth
  React.useEffect(() => {
    if (email && fromEmail === '') {
      setFromEmail(email);
    }
  }, [email, fromEmail]);

  // Pre-fill reply fields if provided
  React.useEffect(() => {
    if (open && replyToEmail) {
      setToEmail(replyToEmail);
    }
    if (open && replySubject) {
      setSubject(replySubject.startsWith('Re:') ? replySubject : `Re: ${replySubject}`);
    }
  }, [open, replyToEmail, replySubject]);

  const handleAddRecipient = () => {
    if (currentRecipientEmail && !recipients.some(r => r.email === currentRecipientEmail && r.type === currentRecipientType)) {
      setRecipients([...recipients, { email: currentRecipientEmail, name: '', type: currentRecipientType }]);
      setCurrentRecipientEmail('');
    }
  };

  const handleDeleteRecipient = (recipientToDelete: RecipientInput) => () => {
    setRecipients((chips) => chips.filter((recipient) => recipient.email !== recipientToDelete.email || recipient.type !== recipientToDelete.type));
  };

  const handleSendEmail = async () => {
    // Auto-add current recipient if there's one typed but not added yet
    if (currentRecipientEmail && currentRecipientEmail.trim() !== '') {
      const emailToAdd = currentRecipientEmail.trim();
      if (!recipients.some(r => r.email === emailToAdd && r.type === currentRecipientType)) {
        setRecipients(prev => [...prev, { email: emailToAdd, name: '', type: currentRecipientType }]);
        setCurrentRecipientEmail('');
      }
    }

    // Detailed validation with specific error messages
    if (!userid) {
      setError('User not authenticated. Please login again.');
      return;
    }
    if (!fromEmail || fromEmail.trim() === '') {
      setError('From email is required.');
      return;
    }
    if (!toEmail && recipients.length === 0 && !currentRecipientEmail) {
      setError('At least one recipient is required.');
      return;
    }
    if (!subject || subject.trim() === '') {
      setError('Subject is required.');
      return;
    }
    if (!textContent || textContent.trim() === '') {
      setError('Email body is required.');
      return;
    }
    
    // Handle recipients:
    // If toEmail is provided (direct single TO recipient), use it for to_email field
    // Otherwise collect from recipients array (for CC/BCC)
    const ccBccRecipients = recipients.filter(r => r.type !== 'to');
    
    // Auto-add current recipient if typed but not added yet
    let finalRecipients = ccBccRecipients;
    if (currentRecipientEmail && currentRecipientEmail.trim() !== '') {
      const emailToAdd = currentRecipientEmail.trim();
      if (currentRecipientType === 'to' && !toEmail) {
        // If no toEmail set and current is TO type, add to toEmail
        // This is handled separately below
      } else {
        // Add as CC/BCC recipient
        finalRecipients = [...finalRecipients, { email: emailToAdd, name: '', type: currentRecipientType }];
      }
    }

    setIsSending(true);
    setError(null);

    // Build email data with to_email field for direct recipient
    const emailData: CreateEmailDto = {
      from_email: fromEmail.trim(),
      subject,
      textcontent: textContent,
      priority,
      status: 'queued',
      to_email: (toEmail || currentRecipientEmail).trim(), // Use toEmail if set, otherwise use currentRecipientEmail if it's a TO type
      recipients: finalRecipients.map(r => ({
        recipient_email: r.email,
        recipient_name: r.name,
        recipient_type: r.type,
      })),
      conversation_id: conversationId, // Include conversation ID for replies
    };

    try {
      await sendEmail(emailData);
      onSendSuccess();
      handleClose();
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setFromEmail('');
    setSubject('');
    setTextContent('');
    setToEmail('');
    setPriority('normal');
    setRecipients([]);
    setCurrentRecipientEmail('');
    setCurrentRecipientType('to');
    setIsSending(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        Compose New Email
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
          <TextField
            margin="dense"
            label="From"
            type="email"
            fullWidth
            variant="outlined"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="your-email@example.com"
          />

          <TextField
            margin="dense"
            label="To"
            type="email"
            fullWidth
            variant="outlined"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="recipient@example.com"
            disabled={!!replyToEmail} // Disable if this is a reply
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FormControl sx={{ minWidth: 80 }}>
              <InputLabel id="recipient-type-label">Type</InputLabel>
              <Select
                labelId="recipient-type-label"
                value={currentRecipientType}
                label="Type"
                onChange={(e: SelectChangeEvent<RecipientType>) => setCurrentRecipientType(e.target.value as RecipientType)}
              >
                <MenuItem value="to">To</MenuItem>
                <MenuItem value="cc">Cc</MenuItem>
                <MenuItem value="bcc">Bcc</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Recipient Email"
              type="email"
              fullWidth
              variant="outlined"
              value={currentRecipientEmail}
              onChange={(e) => setCurrentRecipientEmail(e.target.value)}
              onKeyPress={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  handleAddRecipient();
                }
              }}
            />
            <IconButton color="primary" onClick={handleAddRecipient} disabled={!currentRecipientEmail}>
                <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {recipients.map((recipient, index) => (
              <Chip
                key={`${recipient.email}-${recipient.type}-${index}`}
                avatar={<Avatar>{recipient.type.toUpperCase()}</Avatar>}
                label={`${recipient.email} (${recipient.type})`}
                onDelete={handleDeleteRecipient(recipient)}
                color={recipient.type === 'to' ? 'primary' : recipient.type === 'cc' ? 'secondary' : 'default'}
              />
            ))}
          </Box>

          <TextField
            margin="dense"
            label="Subject"
            type="text"
            fullWidth
            variant="outlined"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Body"
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              value={priority}
              label="Priority"
              onChange={(e: SelectChangeEvent<EmailPriority>) => setPriority(e.target.value as EmailPriority)}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={isSending}>
          Cancel
        </Button>
        <Button onClick={handleSendEmail} color="primary" variant="contained" disabled={isSending}>
          {isSending ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComposeModal;
