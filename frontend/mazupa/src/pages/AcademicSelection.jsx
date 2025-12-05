import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import axios from 'axios';

export default function AcademicSelector() {
  const navigate = useNavigate();
  const [majors, setMajors] = useState([]);
  const [minors, setMinors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedMinor, setSelectedMinor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/majors-minors`
        );

        setMajors(res.data.majors);
        setMinors(res.data.minors);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedMajor) {
      alert('Por favor selecciona al menos un Major');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Llamada a la API para obtener la malla curricular
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/malla`,
        {
          major: selectedMajor,
          minor: selectedMinor || null  // Enviar null si no hay minor seleccionado
        }
      );

      console.log('Malla recibida:', response.data);

      // Navegar a la página de la malla con los datos
      navigate('/malla', { 
        state: { 
          mallaData: response.data,
          major: selectedMajor,
          minor: selectedMinor
        } 
      });
      
    } catch (err) {
      console.error('Error al obtener la malla curricular:', err);
      const errorMessage = err.response?.data?.error || 'Error al cargar la malla curricular. Por favor intenta nuevamente.';
      alert(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: "#F6F6F6"
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: "#0176DE" }} />
          <Typography variant="h6" sx={{ mt: 2, color: "#707070" }}>
            Cargando programas académicos...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: "#F6F6F6"
      }}>
        <Alert severity="error" sx={{ bgcolor: "#F24F4F", color: "white" }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8, minHeight: "100vh", bgcolor: "#F6F6F6" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: "#FFFFFF" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 40, color: "#0176DE", mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="#03122E">
            Selección Académica
          </Typography>
        </Box>
        
        <Typography
          variant="body1"
          textAlign="center"
          sx={{ mb: 4, color: "#707070" }}
        >
          Elige tu programa de estudios en la UC
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl 
            fullWidth 
            required
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#0176DE',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0176DE',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#0176DE',
              },
            }}
          >
            <InputLabel id="major-label">Major</InputLabel>
            <Select
              labelId="major-label"
              id="major"
              value={selectedMajor}
              label="Major"
              onChange={(e) => setSelectedMajor(e.target.value)}
            >
              {majors.map((major) => (
                <MenuItem 
                  key={major.nombre} 
                  value={major.nombre}
                  sx={{
                    '&:hover': {
                      bgcolor: '#F0F0F0',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#EAEAEA',
                      '&:hover': {
                        bgcolor: '#F0F0F0',
                      },
                    },
                  }}
                >
                  {major.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            fullWidth 
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#0176DE',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0176DE',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#0176DE',
              },
            }}
          >
            <InputLabel id="minor-label">Minor (Opcional)</InputLabel>
            <Select
              labelId="minor-label"
              id="minor"
              value={selectedMinor}
              label="Minor (Opcional)"
              onChange={(e) => setSelectedMinor(e.target.value)}
            >
              {minors.map((minor) => (
                <MenuItem 
                  key={minor.nombre} 
                  value={minor.nombre}
                  sx={{
                    '&:hover': {
                      bgcolor: '#F0F0F0',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#EAEAEA',
                      '&:hover': {
                        bgcolor: '#F0F0F0',
                      },
                    },
                  }}
                >
                  {minor.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              mt: 2,
              py: 1.5,
              bgcolor: "#0176DE",
              fontWeight: 600,
              "&:hover": { 
                bgcolor: "#173F8A",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(1, 118, 222, 0.3)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
              "&:disabled": {
                bgcolor: "#CCCCCC",
              },
              transition: "all 0.3s ease",
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                Cargando malla...
              </>
            ) : (
              'Confirmar Selección'
            )}
          </Button>
        </Box>

      </Paper>
    </Container>
  );
}