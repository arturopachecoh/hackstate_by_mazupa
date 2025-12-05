import React from 'react';
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

export default function MallasINGLanding() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/selection');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0176DE 0%, #173F8A 100%)",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 5,
          borderRadius: 3,
          textAlign: "center",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          color: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 60, color: "#FFFFFF" }} />
        </Box>

        <Typography
          variant="h2"
          component="h1"
          fontWeight={700}
          sx={{
            textShadow: "2px 2px 6px rgba(0,0,0,0.35)",
            mb: 2,
          }}
        >
          PLANNER ING
        </Typography>

        <Typography
          variant="h6"
          fontWeight={300}
          sx={{ opacity: 0.9, mb: 4 }}
        >
          Planifica, organiza y simula tu malla
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleStart}
          sx={{
            fontSize: "1.2rem",
            fontWeight: 600,
            py: 1.5,
            px: 4,
            borderRadius: 10,
            bgcolor: "#FFFFFF",
            color: "#0176DE",
            "&:hover": {
              bgcolor: "#F0F0F0",
            },
          }}
        >
          Empezar
        </Button>
      </Paper>
    </Container>
  );
}

