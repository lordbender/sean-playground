import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ApiOutlinedIcon from "@mui/icons-material/ApiOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
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
import { AppSection } from "../App";
import { useAuth } from "../auth/AuthProvider";
import { keycloakAdminUrl } from "../auth/authConfig";
import { BrandMark } from "./BrandMark";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5100").replace(/\/$/, "");
const swaggerDocsUrl = `${apiBaseUrl}/api/swagger`;

type NavItem = {
  label: string;
  icon: SvgIconComponent;
  section?: AppSection;
};

type NavSection = {
  eyebrow: string;
  caption?: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    eyebrow: "Sean's Playground",
    items: [
      { label: "Dashboard", icon: DashboardOutlinedIcon, section: "dashboard" },
      { label: "Sean's Background", icon: WorkHistoryOutlinedIcon, section: "background" }
    ]
  },
  {
    eyebrow: "Support",
    items: [{ label: "Documentation", icon: HelpOutlineOutlinedIcon, section: "documentation" }]
  }
];

type DashboardLayoutProps = PropsWithChildren<{
  activeSection: AppSection;
  isNavCollapsed: boolean;
  onNavigate: (section: AppSection) => void;
  onToggleNavigation: () => void;
}>;

export function DashboardLayout({
  activeSection,
  children,
  isNavCollapsed,
  onNavigate,
  onToggleNavigation
}: DashboardLayoutProps) {
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

  const openSwaggerDocs = () => {
    closeProfileMenu();
    window.open(swaggerDocsUrl, "_blank", "noopener,noreferrer");
  };

  const handleSignOut = async () => {
    closeProfileMenu();
    await signOut();
  };

  return (
    <Box className={isNavCollapsed ? "appShell navCollapsed" : "appShell"}>
      <Box component="header" className="topBar">
        <BrandMark />
        <Tooltip title="Toggle navigation">
          <IconButton
            className="topIconButton"
            aria-label="Toggle navigation"
            aria-controls="primary-navigation"
            aria-expanded={!isNavCollapsed}
            onClick={onToggleNavigation}
          >
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
          <MenuItem onClick={openSwaggerDocs}>
            <ListItemIcon>
              <ApiOutlinedIcon fontSize="small" />
            </ListItemIcon>
            API Swagger Docs
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Box>

      <Box component="aside" className="sideRail" id="primary-navigation">
        {sections.map((section) => (
          <Box key={section.eyebrow} className="navSection">
            <Typography className="navEyebrow">{section.eyebrow}</Typography>
            {section.caption ? <Typography className="navCaption">{section.caption}</Typography> : null}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.section === activeSection;

              return (
                <Tooltip key={item.label} title={isNavCollapsed ? item.label : ""} placement="right">
                  <Button
                    className={isActive ? "navItem active" : "navItem"}
                    startIcon={<Icon />}
                    onClick={item.section ? () => onNavigate(item.section!) : undefined}
                    fullWidth
                  >
                    <span className="navItemLabel">{item.label}</span>
                  </Button>
                </Tooltip>
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
