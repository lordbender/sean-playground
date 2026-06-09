import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { SvgIconComponent } from "@mui/icons-material";
import { MouseEvent, PropsWithChildren, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { keycloakAdminUrl } from "../auth/authConfig";
import { BrandMark } from "./BrandMark";

type NavItem = {
  label: string;
  icon: SvgIconComponent;
  active?: boolean;
  hasMenu?: boolean;
};

type NavSection = {
  eyebrow: string;
  caption?: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    eyebrow: "Sean's Playground",
    caption: "Dashboard",
    items: [{ label: "Dashboard", icon: DashboardOutlinedIcon, active: true }]
  },
  {
    eyebrow: "Pages",
    caption: "Prebuild Pages",
    items: [
      { label: "Sample Page", icon: ArticleOutlinedIcon },
      { label: "Authentication", icon: SecurityOutlinedIcon, hasMenu: true }
    ]
  },
  {
    eyebrow: "Utils",
    items: [
      { label: "Icons", icon: PaletteOutlinedIcon },
      { label: "Typography", icon: TextFieldsOutlinedIcon }
    ]
  },
  {
    eyebrow: "Support",
    items: [{ label: "Documentation", icon: HelpOutlineOutlinedIcon }]
  }
];

export function DashboardLayout({ children }: PropsWithChildren) {
  const { isAdmin, signOut, user } = useAuth();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const profileMenuOpen = Boolean(profileAnchor);

  const openProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setProfileAnchor(null);
  };

  const openKeycloakAdmin = () => {
    closeProfileMenu();
    window.open(keycloakAdminUrl, "_blank", "noopener,noreferrer");
  };

  const handleSignOut = async () => {
    closeProfileMenu();
    await signOut();
  };

  return (
    <Box className="appShell">
      <Box component="header" className="topBar">
        <BrandMark />
        <Tooltip title="Toggle navigation">
          <IconButton className="topIconButton" aria-label="Toggle navigation">
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <TextField
          className="searchField"
          placeholder="Search..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <Tooltip title="Notifications">
          <IconButton className="topIconButton" aria-label="Notifications">
            <NotificationsNoneOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={user?.profile.name ?? "Account"}>
          <IconButton
            className="topIconButton"
            aria-label="Account menu"
            aria-controls={profileMenuOpen ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={profileMenuOpen ? "true" : undefined}
            onClick={openProfileMenu}
          >
            <AccountCircleOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="profile-menu"
          anchorEl={profileAnchor}
          open={profileMenuOpen}
          onClose={closeProfileMenu}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <Box className="profileMenuHeader">
            <Typography fontWeight={800}>{user?.profile.name ?? user?.profile.preferred_username ?? "Account"}</Typography>
            <Typography color="text.secondary" fontSize={13}>
              {isAdmin ? "Admins" : "Users"}
            </Typography>
          </Box>
          {isAdmin ? (
            <MenuItem onClick={openKeycloakAdmin}>
              <ListItemIcon>
                <AdminPanelSettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Manage Keycloak
            </MenuItem>
          ) : null}
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Box>

      <Box component="aside" className="sideRail">
        {sections.map((section) => (
          <Box key={section.eyebrow} className="navSection">
            <Typography className="navEyebrow">{section.eyebrow}</Typography>
            {section.caption ? <Typography className="navCaption">{section.caption}</Typography> : null}
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.label}
                  className={item.active ? "navItem active" : "navItem"}
                  startIcon={<Icon />}
                  endIcon={item.hasMenu ? <KeyboardArrowDownOutlinedIcon /> : undefined}
                  fullWidth
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box component="main" className="dashboardSurface">
        {children}
      </Box>
    </Box>
  );
}
