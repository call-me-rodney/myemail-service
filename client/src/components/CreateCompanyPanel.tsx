import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createCompany } from '../services/api';
import type { CreateCompanyPayload } from '../services/api';

const EMPTY_FORM: CreateCompanyPayload = {
  name: '',
  email: '',
  address: '',
  service: '',
  requesterEmail: '',
};

const CreateCompanyPanel: React.FC = () => {
  const [formData, setFormData] = useState<CreateCompanyPayload>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const openToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createCompany(formData);
      openToast(
        `Company created. A registration link has been sent to ${formData.requesterEmail}.`,
        'success',
      );
      setFormData(EMPTY_FORM);
    } catch (error) {
      openToast('Failed to create company. Please try again.', 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create Company
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Onboard a company onto the platform. Once created, the individual who
            requested it is emailed a link to the registration page so they can
            create their company admin account.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={1}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Company Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Company Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="address"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="service"
                label="Service / Industry"
                name="service"
                value={formData.service}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="requesterEmail"
                label="Requester Email"
                name="requesterEmail"
                type="email"
                value={formData.requesterEmail}
                onChange={handleChange}
                helperText="Email of the individual who requested this company. They'll receive a registration link."
              />
              <Box sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Company'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} variant="filled">
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateCompanyPanel;
