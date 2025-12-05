import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

export default function AcademicSelector() {
  const [majors, setMajors] = useState([]);
  const [minors, setMinors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedMinor, setSelectedMinor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // datos mock
        const mockData = {
          majors: [
            { id: 1, nombre: 'Ingeniería Civil' },
            { id: 2, nombre: 'Psicología' },
            { id: 3, nombre: 'Administración de Empresas' },
            { id: 4, nombre: 'Medicina' },
            { id: 5, nombre: 'Derecho' }
          ],
          minors: [
            { id: 1, nombre: 'Inteligencia Artificial' },
            { id: 2, nombre: 'Emprendimiento' },
            { id: 3, nombre: 'Desarrollo Sostenible' },
            { id: 4, nombre: 'Marketing Digital' },
            { id: 5, nombre: 'Gestión de Proyectos' }
          ],
        };

        await new Promise(resolve => setTimeout(resolve, 500));

        setMajors(mockData.majors);
        setMinors(mockData.minors);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = () => {
    if (!selectedMajor || !selectedMinor) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    const majorSeleccionado = majors.find(m => m.id === selectedMajor);
    const minorSeleccionado = minors.find(m => m.id === selectedMinor);

    alert(`Selección guardada:\nMajor: ${majorSeleccionado?.nombre}\nMinor: ${minorSeleccionado?.nombre}`);
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
                  key={major.id} 
                  value={major.id}
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
            required
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
            <InputLabel id="minor-label">Minor</InputLabel>
            <Select
              labelId="minor-label"
              id="minor"
              value={selectedMinor}
              label="Minor"
              onChange={(e) => setSelectedMinor(e.target.value)}
            >
              {minors.map((minor) => (
                <MenuItem 
                  key={minor.id} 
                  value={minor.id}
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
              transition: "all 0.3s ease",
            }}
          >
            Confirmar Selección
          </Button>
        </Box>

      </Paper>
    </Container>
  );
}
