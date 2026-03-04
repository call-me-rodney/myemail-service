import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const UserManagementPanel: React.FC = () => {
  return (
    <Box>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            This tab is for approving registration requests.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approval workflow UI coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserManagementPanel;
