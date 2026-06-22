import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RegisterSuccessPage: React.FC = () => {
  const navigate = useNavigate();

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
            Request Submitted
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your account has been created and is awaiting approval from your
            company admin.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You'll receive an email once your access has been granted. You can
            sign in after your account is approved.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Go to Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterSuccessPage;
