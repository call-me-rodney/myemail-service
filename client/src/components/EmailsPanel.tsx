import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { sendBulkEmail, sendEmail } from '../services/api';
import type { CreateEmailDto, EmailPriority } from '../types/interfaces';
import { useMailingLists } from '../hooks/useMailingLists';

const EmailsPanel: React.FC = () => {
  const { email, name } = useAuth();
  const { listOptions, addList, getListById, loading: listsLoading } = useMailingLists();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single send state
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [textcontent, setTextcontent] = useState('');
  const [priority] = useState<EmailPriority>('normal');
  const [singleStatus, setSingleStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk send state
  const [selectedListId, setSelectedListId] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkTextcontent, setBulkTextcontent] = useState('');
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Create list inline
  const [newListName, setNewListName] = useState('');
  const [newListEmails, setNewListEmails] = useState('');

  const selectedList = useMemo(() => (selectedListId ? getListById(selectedListId) : null), [selectedListId, getListById]);

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, nextMode: 'single' | 'bulk' | null) => {
    if (nextMode) setMode(nextMode);
  };

  const buildEmailPayload = (payload: { subject: string; textcontent: string; to_email?: string }): CreateEmailDto => {
    return {
      from_email: email || '',
      from_name: name || undefined,
      to_email: payload.to_email,
      subject: payload.subject,
      textcontent: payload.textcontent,
      priority,
      status: 'pending',
      recipients: [],
    };
  };

  const handleSendSingle = async () => {
    setSingleError(null);
    if (!email) {
      setSingleError('Sender email not available. Please log in again.');
      return;
    }
    if (!toEmail.trim()) {
      setSingleError('Destination address is required.');
      return;
    }
    if (!subject.trim()) {
      setSingleError('Subject is required.');
      return;
    }
    if (!textcontent.trim()) {
      setSingleError('Message content is required.');
      return;
    }

    setSingleStatus('sending');
    try {
      const payload = buildEmailPayload({
        subject: subject.trim(),
        textcontent: textcontent.trim(),
        to_email: toEmail.trim(),
      });
      await sendEmail(payload);
      setSingleStatus('success');
      setToEmail('');
      setSubject('');
      setTextcontent('');
    } catch (error) {
      console.error('Failed to send single email:', error);
      setSingleStatus('error');
      setSingleError('Failed to send email. Please try again.');
    }
  };

  const handleCreateList = async () => {
    const emails = newListEmails
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (!newListName.trim() || emails.length === 0) return;
    await addList(newListName, emails);
    setNewListName('');
    setNewListEmails('');
  };

  const handleSendBulk = async () => {
    setBulkError(null);
    if (!email) {
      setBulkError('Sender email not available. Please log in again.');
      return;
    }
    if (!selectedListId) {
      setBulkError('Select a mailing list to continue.');
      return;
    }
    if (!bulkSubject.trim()) {
      setBulkError('Subject is required.');
      return;
    }
    if (!bulkTextcontent.trim()) {
      setBulkError('Message content is required.');
      return;
    }

    const list = getListById(selectedListId);
    if (!list || list.emails.length === 0) {
      setBulkError('Selected list is empty.');
      return;
    }

    setBulkStatus('sending');
    try {
      const payload = buildEmailPayload({
        subject: bulkSubject.trim(),
        textcontent: bulkTextcontent.trim(),
      });
      await sendBulkEmail({ emailPayload: payload, mailingList: list.emails });
      setBulkStatus('success');
      setBulkSubject('');
      setBulkTextcontent('');
      setSelectedListId('');
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      setBulkStatus('error');
      setBulkError('Failed to send bulk email. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Campaign Emails</Typography>
            <Typography variant="body2" color="text.secondary">
              Send a single message or launch a campaign to your mailing lists.
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            sx={{
              borderRadius: 999,
              backgroundColor: 'action.hover',
              p: 0.5,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 999,
                px: 3,
              },
            }}
          >
            <ToggleButton value="single">Single Send</ToggleButton>
            <ToggleButton value="bulk">Bulk Send</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {mode === 'single' && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>Single Send</Typography>
            <Typography variant="body2" color="text.secondary">
              Destination address is required. Sender name and email are pulled from your account.
            </Typography>
            <Divider />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Destination Address"
                value={toEmail}
                onChange={(event) => setToEmail(event.target.value)}
                placeholder="recipient@company.com"
              />
              <TextField
                fullWidth
                label="From"
                value={email ? `${name || 'Sender'} <${email}>` : ''}
                InputProps={{ readOnly: true }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <TextField
              fullWidth
              label="Message"
              value={textcontent}
              onChange={(event) => setTextcontent(event.target.value)}
              multiline
              minRows={6}
            />
            {singleError && (
              <Typography color="error" variant="body2">{singleError}</Typography>
            )}
            {singleStatus === 'success' && (
              <Typography color="success.main" variant="body2">Email queued for sending.</Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Attachments coming soon.
              </Typography>
              <Button variant="contained" onClick={handleSendSingle} disabled={singleStatus === 'sending'}>
                {singleStatus === 'sending' ? 'Sending...' : 'Send Email'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {mode === 'bulk' && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>Bulk Send</Typography>
            <Typography variant="body2" color="text.secondary">
              Select a mailing list or create a new one before sending.
            </Typography>
            <Divider />
            <FormControl fullWidth>
              <InputLabel id="mailing-list-select">Mailing List</InputLabel>
              <Select
                labelId="mailing-list-select"
                label="Mailing List"
                value={selectedListId}
                onChange={(event: SelectChangeEvent) => setSelectedListId(event.target.value)}
              >
                {listOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedList && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedList.emails.slice(0, 6).map((emailAddress) => (
                  <Chip key={emailAddress} label={emailAddress} size="small" />
                ))}
                {selectedList.emails.length > 6 && (
                  <Chip label={`+${selectedList.emails.length - 6} more`} size="small" />
                )}
              </Box>
            )}

            <TextField
              fullWidth
              label="Subject"
              value={bulkSubject}
              onChange={(event) => setBulkSubject(event.target.value)}
            />
            <TextField
              fullWidth
              label="Message"
              value={bulkTextcontent}
              onChange={(event) => setBulkTextcontent(event.target.value)}
              multiline
              minRows={6}
            />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>Create a new list</Typography>
            <TextField
              fullWidth
              label="List name"
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
            />
            <TextField
              fullWidth
              label="Emails (comma separated)"
              value={newListEmails}
              onChange={(event) => setNewListEmails(event.target.value)}
              placeholder="jane@company.com, john@company.com"
            />
            <Button variant="outlined" onClick={handleCreateList} disabled={!newListName.trim() || !newListEmails.trim()}>
              Add mailing list
            </Button>

            {bulkError && (
              <Typography color="error" variant="body2">{bulkError}</Typography>
            )}
            {bulkStatus === 'success' && (
              <Typography color="success.main" variant="body2">Campaign queued for sending.</Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSendBulk} disabled={bulkStatus === 'sending' || listsLoading}>
                {bulkStatus === 'sending' ? 'Sending...' : 'Send Campaign'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EmailsPanel;
