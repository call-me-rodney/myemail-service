import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { deactivateUser, fetchUsers, verifyUser } from '../services/api';
import type { CompanyUser, VerificationRequestPayload } from '../types/interfaces';
import { useAuth } from '../context/AuthContext';

const CompanyAdminRequestsPanel: React.FC = () => {
  const { userid } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CompanyUser[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const openToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const users = await fetchUsers();
      // Pending company admins are users who requested the 'company admin' role
      // and have not yet been verified or deactivated.
      const pending = users.filter(
        (user) =>
          user.role === 'company admin' &&
          user.is_verified !== true &&
          user.is_active !== false,
      );
      setRequests(pending);
    } catch (error) {
      setRequests([]);
      openToast('Failed to fetch company admin requests.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (applicant: CompanyUser) => {
    if (!userid) {
      openToast('Missing system admin context.', 'error');
      return;
    }

    const payload: VerificationRequestPayload = {
      userid: applicant.id,
      verified_by: userid,
      role: 'company admin',
    };

    try {
      const responseMessage = await verifyUser(payload);
      openToast(responseMessage, 'success');
      await loadRequests();
    } catch (error) {
      openToast('Failed to approve company admin.', 'error');
      console.error(error);
    }
  };

  const handleReject = async (applicant: CompanyUser) => {
    try {
      const responseMessage = await deactivateUser(applicant.id);
      openToast(responseMessage, 'success');
      await loadRequests();
    } catch (error) {
      openToast('Failed to reject company admin request.', 'error');
      console.error(error);
    }
  };

  const pendingRequests = useMemo(() => requests, [requests]);

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Company Admin Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approve or reject requests from individuals seeking company admin
            access. Regular users are verified by their own company admins.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Typography color="text.secondary">No pending company admin requests.</Typography>
          ) : (
            <List>
              {pendingRequests.map((applicant) => (
                <ListItem
                  key={applicant.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={`${applicant.fname} ${applicant.lname}`}
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip size="small" label={applicant.company} />
                        <Chip size="small" variant="outlined" label="Company Admin" />
                      </Stack>
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(applicant)}
                    >
                      Reject
                    </Button>
                    <Button variant="contained" onClick={() => handleApprove(applicant)}>
                      Approve
                    </Button>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
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

export default CompanyAdminRequestsPanel;
