import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Divider, Switch, TextField, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';

const SettingsPanel: React.FC = () => {
  const { name, email, updateName } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [displayName, setDisplayName] = useState(name || '');

  const handleSaveName = () => {
    updateName(displayName);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your profile details and appearance preferences.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>Profile</Typography>
          <Divider />
          <TextField
            fullWidth
            label="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            value={email || ''}
            InputProps={{ readOnly: true }}
          />
          <Button variant="contained" onClick={handleSaveName} disabled={!displayName.trim()}>
            Save name
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>Appearance</Typography>
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1">Dark mode</Typography>
            <Switch checked={mode === 'dark'} onChange={toggleMode} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPanel;
