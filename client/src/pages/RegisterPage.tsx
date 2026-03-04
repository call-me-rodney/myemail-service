// client/src/pages/RegisterPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Typography, Container, Box, Paper, Link, MenuItem } from '@mui/material';
import type { CreateUserDTO } from '../types/interfaces';
import { fetchCompanies } from '../services/api';

const COMPANY_CACHE_KEY = 'registration_companies_cache';

const COMMON_TIMEZONES = [
  'UTC',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Jakarta',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
  'America/St_Johns',
  'America/Halifax',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Pacific/Honolulu',
];

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserDTO>({
    fname: '',
    lname: '',
    dob: '',
    company: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const cached = localStorage.getItem(COMPANY_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as string[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCompanyOptions(parsed);
          }
        }

        const companies = await fetchCompanies();
        const names = Array.from(
          new Set(
            companies
              .map((company) => company.name?.trim())
              .filter((name): name is string => Boolean(name)),
          ),
        ).sort((left, right) => left.localeCompare(right));

        if (names.length > 0) {
          setCompanyOptions(names);
          localStorage.setItem(COMPANY_CACHE_KEY, JSON.stringify(names));
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const timezoneOptions = useMemo(() => {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return Array.from(new Set([currentTimezone, ...COMMON_TIMEZONES]));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/register/success');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
      navigate('/register/failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Sign Up for MyMail
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Complete your biodata to request access.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fname"
              label="First Name"
              name="fname"
              autoComplete="given-name"
              value={formData.fname}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lname"
              label="Last Name"
              name="lname"
              autoComplete="family-name"
              value={formData.lname}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="company"
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              select
              disabled={isLoadingCompanies || companyOptions.length === 0}
              helperText={
                isLoadingCompanies
                  ? 'Loading companies...'
                  : companyOptions.length === 0
                    ? 'No companies available yet. Please try again shortly.'
                    : 'Select your company'
              }
            >
              {companyOptions.map((companyOption) => (
                <MenuItem key={companyOption} value={companyOption}>
                  {companyOption}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="dob"
              label="Date of Birth"
              name="dob"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dob}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="timezone"
              label="Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              select
            >
              {timezoneOptions.map((timezoneOption) => (
                <MenuItem key={timezoneOption} value={timezoneOption}>
                  {timezoneOption}
                </MenuItem>
              ))}
            </TextField>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting || isLoadingCompanies || companyOptions.length === 0}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
            <Link href="/login" variant="body2">
              {"Already have an account? Sign In"}
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
