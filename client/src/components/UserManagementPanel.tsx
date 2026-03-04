import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  deactivateUser,
  fetchUnverifiedUsersByCompany,
  fetchUsers,
  verifyUser,
} from '../services/api';
import type { CompanyUser, VerificationRequestPayload } from '../types/interfaces';
import { useAuth } from '../context/AuthContext';

const UserManagementPanel: React.FC = () => {
  const { userid, company } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'all-users'>('requests');
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [requests, setRequests] = useState<CompanyUser[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'company admin'>('user');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const openToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const loadRegistrationRequests = useCallback(async () => {
    if (!company) {
      setRequests([]);
      setLoadingRequests(false);
      return;
    }

    setLoadingRequests(true);
    try {
      const data = await fetchUnverifiedUsersByCompany(company);
      setRequests(data);
    } catch (error) {
      setRequests([]);
      openToast('Failed to fetch registration requests.', 'error');
      console.error(error);
    } finally {
      setLoadingRequests(false);
    }
  }, [company]);

  const loadCompanyUsers = useCallback(async () => {
    if (!company) {
      setCompanyUsers([]);
      setLoadingUsers(false);
      return;
    }

    setLoadingUsers(true);
    try {
      const users = await fetchUsers();
      const filteredUsers = users.filter((user) => user.company === company);
      setCompanyUsers(filteredUsers);
    } catch (error) {
      setCompanyUsers([]);
      openToast('Failed to fetch company users.', 'error');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  }, [company]);

  useEffect(() => {
    loadRegistrationRequests();
    loadCompanyUsers();
  }, [loadRegistrationRequests, loadCompanyUsers]);

  const handleReject = async (targetUser: CompanyUser) => {
    try {
      const responseMessage = await deactivateUser(targetUser.id);
      openToast(responseMessage, 'success');
      await loadRegistrationRequests();
      await loadCompanyUsers();
    } catch (error) {
      openToast('Failed to reject registration request.', 'error');
      console.error(error);
    }
  };

  const handleOpenAcceptDialog = (targetUser: CompanyUser) => {
    setSelectedUser(targetUser);
    setSelectedRole('user');
    setDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedUser || !userid) {
      openToast('Missing admin context or selected user.', 'error');
      return;
    }

    const payload: VerificationRequestPayload = {
      userid: selectedUser.id,
      verified_by: userid,
      role: selectedRole,
    };

    try {
      const responseMessage = await verifyUser(payload);
      openToast(responseMessage, 'success');
      setDialogOpen(false);
      setSelectedUser(null);
      await loadRegistrationRequests();
      await loadCompanyUsers();
    } catch (error) {
      openToast('Failed to verify user.', 'error');
      console.error(error);
    }
  };

  const formattedRequests = useMemo(() => requests, [requests]);

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage registration approvals and view all users under your company.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, value: 'requests' | 'all-users') => setActiveTab(value)}
            sx={{ mb: 2 }}
          >
            <Tab value="requests" label="Registration Requests" />
            <Tab value="all-users" label="All Company Users" />
          </Tabs>

          <Divider sx={{ mb: 2 }} />

          {activeTab === 'requests' && (
            <Box>
              {loadingRequests ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : formattedRequests.length === 0 ? (
                <Typography color="text.secondary">No pending registration requests.</Typography>
              ) : (
                <List>
                  {formattedRequests.map((applicant) => (
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
                        secondary={`DOB: ${new Date(applicant.dob).toLocaleDateString()} • Timezone: ${applicant.timezone}`}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleReject(applicant)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleOpenAcceptDialog(applicant)}
                        >
                          Accept
                        </Button>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 'all-users' && (
            <Box>
              {loadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : companyUsers.length === 0 ? (
                <Typography color="text.secondary">No users found for your company.</Typography>
              ) : (
                <List>
                  {companyUsers.map((companyUser) => (
                    <ListItem
                      key={companyUser.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={`${companyUser.fname} ${companyUser.lname}`}
                        secondary={`Timezone: ${companyUser.timezone}`}
                      />
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          color={companyUser.is_verified ? 'success' : 'warning'}
                          label={companyUser.is_verified ? 'Verified' : 'Pending'}
                        />
                        <Chip
                          size="small"
                          color={companyUser.is_active === false ? 'error' : 'default'}
                          label={companyUser.is_active === false ? 'Inactive' : 'Active'}
                        />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a role for {selectedUser ? `${selectedUser.fname} ${selectedUser.lname}` : 'this applicant'}.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="verify-role-label">Role</InputLabel>
            <Select
              labelId="verify-role-label"
              label="Role"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as 'user' | 'company admin')}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="company admin">Company Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmAccept}>Confirm</Button>
        </DialogActions>
      </Dialog>

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

export default UserManagementPanel;
