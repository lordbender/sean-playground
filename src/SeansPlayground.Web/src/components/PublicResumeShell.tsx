import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { KeyboardEvent, MouseEvent, PropsWithChildren, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { BrandMark } from "./BrandMark";
import { RegistrationDialog } from "./RegistrationDialog";

export function PublicResumeShell({ children }: PropsWithChildren) {
  const { signIn } = useAuth();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const profileMenuOpen = Boolean(profileAnchor);

  const openProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setProfileAnchor(null);
  };

  const handleProfileMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Tab") {
      closeProfileMenu();
    }
  };

  const openRegistration = () => {
    closeProfileMenu();
    setRegistrationOpen(true);
  };

  const handleSignIn = () => {
    closeProfileMenu();
    void signIn();
  };

  return (
    <Box className="publicShell">
      <Box component="header" className="topBar publicTopBar">
        <BrandMark />
        <Box className="publicTopActions">
          <Tooltip title="Profile">
            <IconButton
              className="topIconButton"
              aria-label="Public profile menu"
              aria-controls={profileMenuOpen ? "public-profile-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen ? "true" : undefined}
              onClick={openProfileMenu}
            >
              <AccountCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Popper
          id="public-profile-menu"
          anchorEl={profileAnchor}
          open={profileMenuOpen}
          placement="bottom-end"
          transition
          className="profilePopper"
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: "right top" }}>
              <Paper elevation={8}>
                <ClickAwayListener onClickAway={closeProfileMenu}>
                  <Box>
                    <Box className="profileMenuHeader">
                      <Typography fontWeight={800}>Sean's Playground</Typography>
                      <Typography color="text.secondary" fontSize={13}>
                        Public resume
                      </Typography>
                    </Box>
                    <MenuList autoFocusItem={profileMenuOpen} onKeyDown={handleProfileMenuKeyDown}>
                      <MenuItem onClick={handleSignIn}>
                        <ListItemIcon>
                          <LoginOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        Sign in
                      </MenuItem>
                      <MenuItem onClick={openRegistration}>
                        <ListItemIcon>
                          <PersonAddAltOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        Create account
                      </MenuItem>
                    </MenuList>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Box>
      <Box component="main" className="publicSurface">
        {children}
      </Box>
      <RegistrationDialog open={registrationOpen} onClose={() => setRegistrationOpen(false)} onSignIn={signIn} />
    </Box>
  );
}
