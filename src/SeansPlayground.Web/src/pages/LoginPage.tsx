import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { BrandMark } from "../components/BrandMark";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5100";

type RegistrationForm = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

const initialRegistrationForm: RegistrationForm = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: ""
};

export function LoginPage() {
  const { signIn } = useAuth();
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState(initialRegistrationForm);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);

  const openRegistration = () => {
    setRegistrationOpen(true);
    setRegistrationMessage(null);
    setRegistrationSucceeded(false);
  };

  const closeRegistration = () => {
    if (!registrationSubmitting) {
      setRegistrationOpen(false);
    }
  };

  const updateRegistrationField = (field: keyof RegistrationForm, value: string) => {
    setRegistrationForm((current) => ({ ...current, [field]: value }));
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistrationMessage(null);

    if (registrationForm.password !== registrationForm.confirmPassword) {
      setRegistrationMessage("Passwords must match.");
      return;
    }

    setRegistrationSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/registration/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registrationForm.username,
          email: registrationForm.email,
          firstName: registrationForm.firstName,
          lastName: registrationForm.lastName,
          password: registrationForm.password
        })
      });

      const payload = (await response.json()) as { succeeded: boolean; message: string };

      if (!response.ok || !payload.succeeded) {
        setRegistrationMessage(payload.message || "The account could not be created.");
        return;
      }

      setRegistrationSucceeded(true);
      setRegistrationMessage(payload.message);
      setRegistrationForm(initialRegistrationForm);
    } catch {
      setRegistrationMessage("The account could not be created right now.");
    } finally {
      setRegistrationSubmitting(false);
    }
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

      <Dialog open={registrationOpen} onClose={closeRegistration} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={submitRegistration}>
          <DialogTitle>Create your account</DialogTitle>
          <DialogContent>
            <Stack spacing={2.2} sx={{ pt: 1 }}>
              {registrationMessage ? (
                <Alert severity={registrationSucceeded ? "success" : "error"}>{registrationMessage}</Alert>
              ) : null}
              <Box className="registrationNameGrid">
                <TextField
                  label="First name"
                  value={registrationForm.firstName}
                  onChange={(event) => updateRegistrationField("firstName", event.target.value)}
                  required
                  disabled={registrationSubmitting || registrationSucceeded}
                />
                <TextField
                  label="Last name"
                  value={registrationForm.lastName}
                  onChange={(event) => updateRegistrationField("lastName", event.target.value)}
                  required
                  disabled={registrationSubmitting || registrationSucceeded}
                />
              </Box>
              <TextField
                label="Username"
                value={registrationForm.username}
                onChange={(event) => updateRegistrationField("username", event.target.value)}
                inputProps={{ minLength: 3 }}
                required
                disabled={registrationSubmitting || registrationSucceeded}
              />
              <TextField
                label="Email"
                type="email"
                value={registrationForm.email}
                onChange={(event) => updateRegistrationField("email", event.target.value)}
                required
                disabled={registrationSubmitting || registrationSucceeded}
              />
              <Box className="registrationNameGrid">
                <TextField
                  label="Password"
                  type="password"
                  value={registrationForm.password}
                  onChange={(event) => updateRegistrationField("password", event.target.value)}
                  inputProps={{ minLength: 8 }}
                  required
                  disabled={registrationSubmitting || registrationSucceeded}
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  value={registrationForm.confirmPassword}
                  onChange={(event) => updateRegistrationField("confirmPassword", event.target.value)}
                  inputProps={{ minLength: 8 }}
                  required
                  disabled={registrationSubmitting || registrationSucceeded}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRegistration} disabled={registrationSubmitting}>
              Close
            </Button>
            {registrationSucceeded ? (
              <Button variant="contained" onClick={signIn} startIcon={<LoginOutlinedIcon />}>
                Sign in
              </Button>
            ) : (
              <Button variant="contained" type="submit" disabled={registrationSubmitting} startIcon={<PersonAddAltOutlinedIcon />}>
                {registrationSubmitting ? "Creating..." : "Create account"}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
