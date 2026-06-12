import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { BrandMark } from "../components/BrandMark";
import { RegistrationDialog } from "../components/RegistrationDialog";

export function LoginPage() {
  const { signIn } = useAuth();
  const [registrationOpen, setRegistrationOpen] = useState(false);

  const openRegistration = () => {
    setRegistrationOpen(true);
  };

  return (
    <Box className="loginPage">
      <Paper className="loginPanel" elevation={0}>
        <BrandMark />
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h3" className="loginTitle">
              Sean's Playground
            </Typography>
            <Typography className="loginCopy">
              Local dashboard workspace with Keycloak sign-in, Postgres-backed services, and a Material UI shell.
            </Typography>
          </Box>
          <Button variant="contained" size="large" startIcon={<LoginOutlinedIcon />} onClick={signIn}>
            Sign in with Keycloak
          </Button>
          <Button variant="outlined" size="large" startIcon={<PersonAddAltOutlinedIcon />} onClick={openRegistration}>
            Create an account
          </Button>
        </Stack>
      </Paper>
      <Box className="loginPreview" aria-hidden>
        <Box className="previewTop" />
        <Box className="previewGrid">
          <span />
          <span />
          <span />
          <span />
        </Box>
        <Box className="previewChart" />
      </Box>

      <RegistrationDialog open={registrationOpen} onClose={() => setRegistrationOpen(false)} onSignIn={signIn} />
    </Box>
  );
}
