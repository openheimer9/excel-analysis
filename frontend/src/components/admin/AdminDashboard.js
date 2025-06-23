import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Block as BanIcon,
  CheckCircle as UnbanIcon,
  History as ActivityIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";

// Light techy blue palette
const palette = {
  bg: "#f4faff",
  card: "#e3f2fd",
  border: "#b3e5fc",
  accent: "#1976d2",
  accentLight: "#42a5f5",
  accentDark: "#1565c0",
  error: "#e57373",
  warning: "#ffb300",
  text: "#222b45",
  muted: "#78909c",
  chipAdmin: "#1976d2",
  chipUser: "#42a5f5",
};

const font = "'Poppins', 'Roboto', Arial, sans-serif";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalAnalyses: 0,
  });
  const [error, setError] = useState("");
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState({
    lastActive: null,
    activityLog: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      setError("Failed to fetch statistics");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete user";
      setError(errorMsg);
    }
  };

  const handleToggleBan = async (userId, currentBanStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.patch(`/users/${userId}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update ban status";
      setError(errorMsg);
    }
  };

  const handleViewActivity = async (user) => {
    setSelectedUser(user);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/users/${user._id}/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserActivity(response.data);
      setActivityDialogOpen(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch user activity";
      setError(errorMsg);
    }
  };

  const handleCloseActivityDialog = () => {
    setActivityDialogOpen(false);
    setSelectedUser(null);
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${palette.bg} 0%, #e3f2fd 100%)`,
      fontFamily: font,
      color: palette.text,
      py: 6,
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: font,
                color: palette.accent,
                textAlign: "center",
                fontWeight: 600,
                letterSpacing: 1,
                mb: 3,
                mt: 1,
                userSelect: "none",
                textShadow: `0 2px 8px ${palette.accentLight}22`,
              }}
            >
              ADMIN DASHBOARD
            </Typography>
          </Grid>

          {/* Statistics Cards */}
          {[
            { title: "Total Users", value: stats.totalUsers, icon: "👤" },
            { title: "Total Files", value: stats.totalFiles, icon: "📁" },
            { title: "Total Analyses", value: stats.totalAnalyses, icon: "📊" },
          ].map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 4,
                  background: `linear-gradient(120deg, #e3f2fd 60%, #f4faff 100%)`,
                  border: `1.5px solid ${palette.border}`,
                  boxShadow: `0 2px 12px 0 ${palette.accentLight}22`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px) scale(1.01)",
                    boxShadow: `0 6px 24px 0 ${palette.accentLight}33`,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: palette.accent,
                    fontWeight: 700,
                    letterSpacing: 1,
                    mb: 1,
                  }}
                >
                  {card.icon} {card.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: palette.accentDark,
                    fontWeight: 800,
                    fontFamily: font,
                    letterSpacing: 2,
                  }}
                >
                  {card.value}
                </Typography>
              </Paper>
            </Grid>
          ))}

          {/* Users Table */}
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 4,
                background: palette.card,
                border: `1.5px solid ${palette.border}`,
                mt: 2,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: palette.accentDark,
                  fontWeight: 700,
                  textAlign: "center",
                  pb: 2,
                  letterSpacing: 1,
                }}
              >
                USER MANAGEMENT
              </Typography>
              {error && (
                <Typography color="error" gutterBottom>
                  {error}
                </Typography>
              )}
              <TableContainer
                sx={{
                  borderRadius: 3,
                  background: "#f7fbff",
                  boxShadow: `0 1px 8px 0 ${palette.accentLight}11`,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#e3f2fd" }}>
                      <TableCell sx={{ fontWeight: 700, color: palette.accent }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: palette.accent }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: palette.accent }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: palette.accent }}>Created At</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: palette.accent }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          background: index % 2 === 0 ? "#f7fbff" : "#e3f2fd",
                          "&:hover": {
                            background: "#e3f2fd",
                          },
                        }}
                      >
                        <TableCell sx={{ color: palette.text }}>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            sx={{
                              fontWeight: 600,
                              color: "#fff",
                              background: user.role === "admin"
                                ? palette.chipAdmin
                                : palette.chipUser,
                              borderRadius: 1,
                              fontSize: 13,
                              px: 1.5,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.banned ? (
                            <Chip
                              label="BANNED"
                              sx={{
                                fontWeight: 700,
                                background: palette.error,
                                color: "#fff",
                                borderRadius: 1,
                                fontSize: 13,
                                px: 1.5,
                              }}
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="ACTIVE"
                              sx={{
                                fontWeight: 700,
                                background: palette.accent,
                                color: "#fff",
                                borderRadius: 1,
                                fontSize: 13,
                                px: 1.5,
                              }}
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: palette.muted }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="View Activity">
                              <IconButton
                                size="small"
                                sx={{
                                  color: palette.accent,
                                  border: `1.5px solid ${palette.accentLight}`,
                                  background: "#f7fbff",
                                  "&:hover": {
                                    background: palette.accentLight,
                                    color: "#fff",
                                  },
                                  transition: "all 0.2s",
                                }}
                                onClick={() => handleViewActivity(user)}
                              >
                                <ActivityIcon />
                              </IconButton>
                            </Tooltip>
                            {user.role !== "admin" && (
                              <>
                                <Tooltip title={user.banned ? "Unban User" : "Ban User"}>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: user.banned ? palette.accent : palette.error,
                                      border: `1.5px solid ${user.banned ? palette.accentLight : palette.error}`,
                                      background: "#f7fbff",
                                      "&:hover": {
                                        background: user.banned ? palette.accentLight : palette.error,
                                        color: "#fff",
                                      },
                                      transition: "all 0.2s",
                                    }}
                                    onClick={() => handleToggleBan(user._id, user.banned)}
                                  >
                                    {user.banned ? <UnbanIcon /> : <BanIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    color: palette.error,
                                    border: `1.5px solid ${palette.error}`,
                                    borderRadius: 2,
                                    px: 2,
                                    background: "#fff",
                                    "&:hover": {
                                      background: palette.error,
                                      color: "#fff",
                                    },
                                    transition: "all 0.2s",
                                  }}
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* User Activity Dialog */}
        <Dialog
          open={activityDialogOpen}
          onClose={handleCloseActivityDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "#f7fbff",
              border: `1.5px solid ${palette.border}`,
            },
          }}
        >
          <DialogTitle sx={{
            fontWeight: 700,
            color: palette.accent,
            fontFamily: font,
            letterSpacing: 1,
          }}>
            {selectedUser ? `Activity for ${selectedUser.email}` : "User Activity"}
          </DialogTitle>
          <DialogContent dividers>
            {selectedUser && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ color: palette.accent }}>
                  Last Active:{" "}
                  {userActivity.lastActive
                    ? formatActivityDate(userActivity.lastActive)
                    : "Never"}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, color: palette.accent }}>
                  Activity Log
                </Typography>
                {userActivity.activityLog && userActivity.activityLog.length > 0 ? (
                  <List>
                    {userActivity.activityLog.map((activity, index) => (
                      <ListItem
                        key={index}
                        divider={index < userActivity.activityLog.length - 1}
                        sx={{
                          background: index % 2 === 0
                            ? "#f7fbff"
                            : "#e3f2fd",
                          borderRadius: 2,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: palette.accent, fontFamily: font }}
                            >
                              {activity.action}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" sx={{ color: palette.text }}>
                                {formatActivityDate(activity.timestamp)}
                              </Typography>
                              {activity.details && (
                                <Box sx={{ mt: 1 }}>
                                  {Object.entries(activity.details).map(
                                    ([key, value]) => (
                                      <Typography
                                        key={key}
                                        component="div"
                                        variant="body2"
                                        sx={{ color: palette.muted, fontFamily: font }}
                                      >
                                        <strong>{key}:</strong> {JSON.stringify(value)}
                                      </Typography>
                                    )
                                  )}
                                </Box>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No activity recorded for this user.
                  </Typography>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseActivityDialog}
              variant="contained"
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                fontFamily: font,
                background: palette.accent,
                color: "#fff",
                boxShadow: "0 1px 6px 0 #1976d233",
                "&:hover": {
                  background: palette.accentLight,
                  color: "#fff",
                },
                transition: "all 0.2s",
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
