import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface ComingSoonPanelProps {
  title: string;
}

const ComingSoonPanel: React.FC<ComingSoonPanelProps> = ({ title }) => {
  return (
    <Box>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComingSoonPanel;
