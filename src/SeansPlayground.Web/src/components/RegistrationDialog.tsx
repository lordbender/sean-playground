import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormEvent, useState } from "react";

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

type RegistrationDialogProps = {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
};

export function RegistrationDialog({ open, onClose, onSignIn }: RegistrationDialogProps) {
  const [registrationForm, setRegistrationForm] = useState(initialRegistrationForm);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);

  const closeRegistration = () => {
    if (!registrationSubmitting) {
      onClose();
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
    <Dialog open={open} onClose={closeRegistration} fullWidth maxWidth="sm">
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
            <Button variant="contained" onClick={onSignIn} startIcon={<LoginOutlinedIcon />}>
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
  );
}
