import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useMailingLists } from '../hooks/useMailingLists';

const MailingListsPanel: React.FC = () => {
  const { lists, addList, removeList, loading, error } = useMailingLists();
  const [name, setName] = useState('');
  const [emails, setEmails] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    const items = emails
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (!name.trim() || items.length === 0) return;
    await addList(name, items, description);
    setName('');
    setEmails('');
    setDescription('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>Mailing Lists</Typography>
          <Typography variant="body2" color="text.secondary">
            Create, view, and manage your campaign lists.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => {}}>{error}</Alert>
      )}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>Create a new list</Typography>
          <TextField
            fullWidth
            label="List name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextField
            fullWidth
            label="Emails (comma separated)"
            value={emails}
            onChange={(event) => setEmails(event.target.value)}
            placeholder="jane@company.com, john@company.com"
          />
          <Button variant="contained" onClick={handleCreate} disabled={!name.trim() || !emails.trim()}>
            Save list
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>Your lists</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            {lists.length === 0 && (
              <Typography variant="body2" color="text.secondary">No lists yet. Create one above!</Typography>
            )}
            {lists.map((list) => (
              <Box key={list.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{list.name}</Typography>
                    {list.description && (
                      <Typography variant="caption" color="text.secondary">{list.description}</Typography>
                    )}
                  </Box>
                  <IconButton onClick={() => list.id && removeList(list.id)} size="small">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {list.emails.slice(0, 6).map((email) => (
                    <Chip key={email} label={email} size="small" />
                  ))}
                  {list.emails.length > 6 && (
                    <Chip label={`+${list.emails.length - 6} more`} size="small" />
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MailingListsPanel;
