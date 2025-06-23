import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    recentUploads: 0,
    analyses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchStats();
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/files/my-files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Calculate stats from files
      const files = response.data;
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        totalFiles: files.length,
        recentUploads: files.filter(file => new Date(file.uploadDate) > lastWeek).length,
        analyses: 0, // This would need a separate API call to get analysis count
      });
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Files",
      value: stats.totalFiles,
      icon: <HistoryIcon sx={{ fontSize: 40, color: "#0c4a6e" }} />,
      color: "#e0f2fe",
      borderColor: "#0c4a6e",
    },
    {
      title: "Recent Uploads",
      value: stats.recentUploads,
      icon: <CloudUploadIcon sx={{ fontSize: 40, color: "#1e40af" }} />,
      color: "#dbeafe",
      borderColor: "#1e40af",
    },
    {
      title: "Analyses Created",
      value: stats.analyses,
      icon: <BarChartIcon sx={{ fontSize: 40, color: "#1e3a8a" }} />,
      color: "#eff6ff",
      borderColor: "#1e3a8a",
    },
    {
      title: "AI Chat Sessions",
      value: 0, // This would need to be tracked separately
      icon: <ChatIcon sx={{ fontSize: 40, color: "#0369a1" }} />,
      color: "#f0f9ff",
      borderColor: "#0369a1",
    },
  ];

  return (
    <>
      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
          border: "1px solid #bae6fd",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 25px 25px, rgba(12, 74, 110, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(12, 74, 110, 0.1) 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            opacity: 0.3,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #0c4a6e, #1e40af)",
          },
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ 
            color: "#0c4a6e", 
            fontWeight: "bold",
            position: "relative",
            display: "inline-block",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -5,
              left: 0,
              width: "40%",
              height: "3px",
              background: "linear-gradient(90deg, #0c4a6e, transparent)",
              borderRadius: "3px",
            }
          }}
        >
          Welcome, {user?.email?.split('@')[0] || 'User'}!
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#334155" }}>
          This is your Excel Analysis Platform dashboard. From here, you can access all the tools to analyze and visualize your Excel data.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: card.color,
                height: "100%",
                border: `1px solid ${card.borderColor}20`,
                transition: "all 0.3s",
                transform: "translateZ(0)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-5px) translateZ(10px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: card.borderColor,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "30%",
                  height: "30%",
                  background: index % 2 === 0 ?
                    "radial-gradient(circle, rgba(12,74,110,0.1) 10%, transparent 10.5%) 0 0/15px 15px" :
                    "linear-gradient(45deg, rgba(12,74,110,0.1) 25%, transparent 25%, transparent 50%, rgba(12,74,110,0.1) 50%, rgba(12,74,110,0.1) 75%, transparent 75%, transparent) 0 0/20px 20px",
                  opacity: 0.5,
                  pointerEvents: "none",
                },
              }}
            >
              <Box
                className="card-3d-content"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "600", mb: 1, color: card.borderColor }}
                  >
                    {card.title}
                  </Typography>
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: card.borderColor }} />
                  ) : (
                    <Typography variant="h3" sx={{ 
                      fontWeight: "bold", 
                      color: "#1e293b",
                      textShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      {card.value}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ 
                  animation: "float 3s ease-in-out infinite",
                  filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.1))"
                }}>
                  {card.icon}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Tips */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.05)",
          background: "white",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%230c4a6e\" fill-opacity=\"0.02\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            pointerEvents: "none",
            opacity: 0.5,
          },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ 
            fontWeight: "bold", 
            mb: 2, 
            color: "#0c4a6e",
            position: "relative",
            display: "inline-block",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -5,
              left: 0,
              width: "40%",
              height: "3px",
              background: "linear-gradient(90deg, #0c4a6e, transparent)",
              borderRadius: "3px",
            }
          }}
        >
          Quick Tips
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: "100%", 
              boxShadow: "none", 
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              transition: "all 0.3s",
              transform: "translateZ(0)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                boxShadow: "0 15px 30px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.03)",
                borderColor: "#0c4a6e20",
                transform: "translateY(-5px) translateZ(0)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(12,74,110,0.03) 0%, transparent 50%)",
                pointerEvents: "none",
              },
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  color: "#0c4a6e", 
                  fontWeight: "bold", 
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                  <CloudUploadIcon fontSize="small" />
                  Upload Files
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  Upload your Excel files (.xlsx, .xls) using the Upload Files section in the sidebar menu.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: "100%", 
              boxShadow: "none", 
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              transition: "all 0.3s",
              transform: "translateZ(0)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                boxShadow: "0 15px 30px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.03)",
                borderColor: "#0c4a6e20",
                transform: "translateY(-5px) translateZ(0)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(12,74,110,0.03) 0%, transparent 50%)",
                pointerEvents: "none",
              },
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  color: "#0c4a6e", 
                  fontWeight: "bold", 
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                  <BarChartIcon fontSize="small" />
                  Analyze Data
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  View detailed analysis of your Excel data with charts and insights using the Analysis section.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: "100%", 
              boxShadow: "none", 
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              transition: "all 0.3s",
              transform: "translateZ(0)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                boxShadow: "0 15px 30px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.03)",
                borderColor: "#0c4a6e20",
                transform: "translateY(-5px) translateZ(0)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(12,74,110,0.03) 0%, transparent 50%)",
                pointerEvents: "none",
              },
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  color: "#0c4a6e", 
                  fontWeight: "bold", 
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                  <ChatIcon fontSize="small" />
                  Chat with Files
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  Ask questions about your Excel data and get instant answers using our AI-powered chat interface.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default Dashboard;
