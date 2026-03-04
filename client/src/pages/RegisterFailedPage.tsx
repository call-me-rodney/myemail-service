import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const RegisterFailedPage: React.FC = () => {
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
          <ErrorOutlineIcon color="error" sx={{ fontSize: 72, mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="error.main" gutterBottom>
            Registration Failed
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            We couldn’t complete your registration request.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please try again. If the issue persists, contact support at support@brevomail.me.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/register')}>
            Back to Registration
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterFailedPage;
