import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  History as HistoryIcon,
  BarChart as AnalyticsIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from "@mui/icons-material";

const drawerWidth = 240;

const SidebarLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Upload Files",
      icon: <UploadIcon />,
      path: "/upload",
    },
    {
      text: "File History",
      icon: <HistoryIcon />,
      path: "/file-history",
    },
    {
      text: "Chat with Files",
      icon: <ChatIcon />,
      path: "/chat",
    },
  ];

  if (isAdmin) {
    menuItems.unshift({
      text: "Admin Dashboard",
      icon: <DashboardIcon />,
      path: "/admin",
    });
  }

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c4a6e", // Navy blue background
          color: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)",
            backgroundSize: "10px 10px",
            opacity: 0.1,
            pointerEvents: "none",
            animation: "patternMove 20s linear infinite",
          },
          "@keyframes patternMove": {
            "0%": { backgroundPosition: "0 0" },
            "100%": { backgroundPosition: "50px 50px" },
          },
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            fontWeight: "bold", 
            color: "white",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)"
          }}
        >
          ExcelAnalyzer
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ backgroundColor: "#f8fafc" }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(12, 74, 110, 0.08)", // Navy blue with opacity
                  borderLeft: "4px solid #0c4a6e", // Navy blue border
                  paddingLeft: "12px",
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "url('/tech-dots.svg') right center/contain no-repeat",
                    opacity: 0.05,
                    pointerEvents: "none",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(12, 74, 110, 0.12)", // Slightly darker on hover
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(12, 74, 110, 0.04)", // Very light navy on hover
                },
                transition: "all 0.2s ease",
                borderLeft: "4px solid transparent",
                paddingLeft: "12px",
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path ? "#0c4a6e" : "#64748b", // Navy blue when selected
                  transition: "color 0.2s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight:
                    location.pathname === item.path ? "600" : "normal",
                  color:
                    location.pathname === item.path ? "#0c4a6e" : "#334155", // Navy blue when selected
                  transition: "color 0.2s ease",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ backgroundColor: "#f8fafc" }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(220, 38, 38, 0.04)", // Light red on hover
              },
              transition: "all 0.2s ease",
            }}
          >
            <ListItemIcon sx={{ color: "#dc2626" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                color: "#dc2626",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "#0c4a6e", // Navy blue
          backgroundImage: "linear-gradient(to right, #0c4a6e, #1e40af)", // Gradient effect
          color: "white",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              "Excel Analysis Platform"}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#0c4a6e", // Changed to navy blue
                fontSize: "0.875rem",
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0, 0, 0, 0.08)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f1f5f9", // Light blue-gray background
          backgroundImage: "linear-gradient(to bottom right, #f1f5f9, #e2e8f0)", // Subtle gradient
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 25px 25px, rgba(12, 74, 110, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(12, 74, 110, 0.03) 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            pointerEvents: "none",
          },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout;