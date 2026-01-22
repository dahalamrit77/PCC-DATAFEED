import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, Chip, CircularProgress, 
  Stack, Typography, Alert 
} from '@mui/material';
import { patientService } from '../../services/patient.service';
import type { PatientDetail } from '../../types/patient.types';

export const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await patientService.getPatientDetails(id);
        if (data) {
          setPatient(data);
        } else {
          setError('Patient record not found.');
        }
      } catch (err) {
        setError('Unable to load patient profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  if (error || !patient) return <Alert severity="error" sx={{ m: 2 }}>{error || 'Patient not found'}</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
            CENSUS DASHBOARD / PATIENT #{patient.patientId}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2} mt={1}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {patient.lastName}, {patient.firstName}
            </Typography>
            <Chip 
              label={patient.patientStatus} 
              color={patient.patientStatus === 'Current' ? 'success' : 'default'} 
              size="small" 
              sx={{ fontWeight: 'bold' }}
            />
          </Stack>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            DOB: {patient.birthDate} ({patient.gender})
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>Back to List</Button>
      </Box>

      {/* 3-COLUMN LAYOUT (Using CSS Grid instead of MUI Grid to fix TS errors) */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
        gap: 3 
      }}>
        
        {/* COL 1: LOGISTICS */}
        <Box>
          <Card sx={{ height: '100%', borderTop: '4px solid #ed6c02' }}>
            <CardContent>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DELIVERY LOCATION</Typography>
              <Box sx={{ mt: 2, mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center', border: '1px dashed #ed6c02' }}>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>ROOM</Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: 'text.primary' }}>{patient.roomDesc || 'N/A'}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>BED {patient.bedDesc || '-'}</Typography>
              </Box>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Unit</Typography>
                  <Typography variant="body2" fontWeight="bold">{patient.unitName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Floor</Typography>
                  <Typography variant="body2" fontWeight="bold">{patient.floorName}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* COL 2: CLINICAL */}
        <Box>
          <Card sx={{ height: '100%', borderTop: '4px solid #d32f2f' }}>
            <CardContent>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CLINICAL SNAPSHOT</Typography>
              <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>ALLERGIES</Typography>
                <Stack direction="row" spacing={1}>
                  {patient.allergies.map(alg => (
                    <Chip key={alg} label={alg} color="error" variant="outlined" size="small" />
                  ))}
                </Stack>
              </Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>PRIMARY PHYSICIAN</Typography>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">{patient.primaryPhysician.name}</Typography>
                <Typography variant="caption" display="block">{patient.primaryPhysician.specialty}</Typography>
                <Typography variant="caption" color="primary">{patient.primaryPhysician.phone}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* COL 3: PAYER INFO */}
        <Box>
          <Card sx={{ height: '100%', borderTop: '4px solid #0288d1' }}>
            <CardContent>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PAYER INFORMATION</Typography>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(2, 136, 209, 0.08)', borderRadius: 2, border: '1px solid rgba(2, 136, 209, 0.2)' }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" fontWeight="bold" color="primary">PRIMARY</Typography>
                  <Typography variant="caption" fontWeight="bold" color="success.main">VERIFIED</Typography>
                </Stack>
                <Typography variant="h6" fontWeight="bold">
                  {patient.activeCoverage.primary?.payerName || 'Private Pay'}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                  Code: {patient.activeCoverage.primary?.payerCode || 'N/A'}
                </Typography>
              </Box>

              {patient.activeCoverage.secondary && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, opacity: 0.8 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">SECONDARY</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {patient.activeCoverage.secondary.payerName}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

      </Box>
    </Box>
  );
};