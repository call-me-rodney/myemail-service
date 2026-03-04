import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RegisterSuccessPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={4} sx={{ p: 5, borderRadius: 3, textAlign: 'center', width: '100%' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 72, mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="success.main" gutterBottom>
            Registration Successful
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your registration request was submitted successfully.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterSuccessPage;
