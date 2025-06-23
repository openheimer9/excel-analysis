import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Fade,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  BubbleChart as BubbleChartIcon,
  ViewInAr as ThreeDIcon,
  Description as FileIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";

const palette = {
  accent: "#1976d2",
  accentLight: "#42a5f5",
  accentDark: "#1565c0",
  error: "#e57373",
  bg: "#f4faff",
  card: "#e3f2fd",
};

const font = "'Poppins', 'Roboto', Arial, sans-serif";

const FileUpload = () => {
  const navigate = useNavigate();

  // Upload states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dimensionType, setDimensionType] = useState("2D");
  const [chartType, setChartType] = useState("line");

  // Previously uploaded files
  const [previousFiles, setPreviousFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    fetchPreviousFiles();
    // eslint-disable-next-line
  }, []);

  // File validation and selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = "." + selectedFile.name.split(".").pop().toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      setError("Invalid file type. Please upload a CSV or Excel file.");
      setFile(null);
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setUploading(false);
        return;
      }
      const response = await axiosInstance.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data._id) {
        navigate(
          `/analysis/${response.data._id}?chartType=${chartType}&dimension=${dimensionType}`
        );
      } else {
        navigate("/dashboard");
      }
      setFile(null);
      fetchPreviousFiles(); // Refresh files after upload
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDimensionChange = (event) => {
    const dimension = event.target.value;
    setDimensionType(dimension);
    setChartType(dimension === "2D" ? "line" : "scatter3d");
  };

  const chartOptions = {
    "2D": [
      { value: "line", label: "Line Chart", icon: <LineChartIcon /> },
      { value: "bar", label: "Bar Chart", icon: <BarChartIcon /> },
      { value: "pie", label: "Pie Chart", icon: <PieChartIcon /> },
      { value: "radar", label: "Radar Chart", icon: <LineChartIcon /> },
      { value: "scatter", label: "Scatter Plot", icon: <BubbleChartIcon /> },
      { value: "bubble", label: "Bubble Chart", icon: <BubbleChartIcon /> },
    ],
    "3D": [
      { value: "scatter3d", label: "3D Scatter Plot", icon: <ThreeDIcon /> },
      { value: "surface", label: "3D Surface Plot", icon: <ThreeDIcon /> },
      { value: "mesh3d", label: "3D Mesh Plot", icon: <ThreeDIcon /> },
      { value: "line3d", label: "3D Line Plot", icon: <ThreeDIcon /> },
    ],
  };

  const fetchPreviousFiles = async () => {
    setLoadingFiles(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoadingFiles(false);
        return;
      }
      
      // Update the endpoint to match the backend route
      const response = await axiosInstance.get('/files/my-files', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPreviousFiles(Array.isArray(response.data) ? response.data : 
                      (response.data.files ? response.data.files : []));
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.response) {
        setError(`Error ${error.response.status}: ${error.response.data?.message || 'Failed to fetch files'}`);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up request: ' + error.message);
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  const handlePreviousFileSelect = (fileId) => {
    navigate(`/analysis/${fileId}`);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        {/* File Upload Section */}
        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: 3,
            boxShadow: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: `linear-gradient(to bottom right, #ffffff, ${palette.card})`,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            gutterBottom
            align="center"
            sx={{ color: palette.accent, fontFamily: font }}
          >
            Upload Excel File
          </Typography>
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          <input
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                px: 3,
                py: 1,
                borderColor: palette.accent,
                color: palette.accentDark,
                "&:hover": {
                  backgroundColor: palette.accentLight + "22",
                  borderColor: palette.accentDark,
                },
              }}
            >
              Select File
            </Button>
          </label>

          <Fade in={!!file}>
            <Typography variant="subtitle1" color="text.secondary">
              {file?.name}
            </Typography>
          </Fade>

          {file && (
            <>
              <Divider sx={{ width: "100%", my: 2 }} />

              <Typography
                variant="h6"
                sx={{
                  color: palette.accentDark,
                  fontFamily: font,
                  mb: 1,
                }}
              >
                Chart Options
              </Typography>
              <Box sx={{ width: "100%" }}>
                <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Chart Dimension:
                  </Typography>
                  <RadioGroup
                    row
                    value={dimensionType}
                    onChange={handleDimensionChange}
                  >
                    <FormControlLabel value="2D" control={<Radio />} label="2D" />
                    <FormControlLabel value="3D" control={<Radio />} label="3D" />
                  </RadioGroup>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    label="Chart Type"
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    {chartOptions[dimensionType].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {option.icon}
                          <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
            sx={{
              mt: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1,
              backgroundColor: palette.accent,
              "&:hover": {
                backgroundColor: palette.accentDark,
              },
            }}
          >
            {uploading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : (
              "Upload & Generate Chart"
            )}
          </Button>
        </Paper>

        {/* Previously Uploaded Files Section */}
        <Paper
          elevation={3}
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "#fff",
            borderRadius: 2,
            border: "1px solid rgba(12, 74, 110, 0.1)",
            boxShadow: "0 4px 20px rgba(12, 74, 110, 0.08)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#0c4a6e', // Navy blue color
                fontWeight: 600 
              }}
            >
              Previously Uploaded Files
            </Typography>
            <IconButton onClick={fetchPreviousFiles} sx={{ ml: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {loadingFiles ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} sx={{ color: "#0c4a6e" }} />
            </Box>
          ) : previousFiles && previousFiles.length > 0 ? (
            <List sx={{ width: "100%" }}>
              {previousFiles.map((file) => (
                <React.Fragment key={file._id}>
                  <ListItem
                    button
                    onClick={() => handlePreviousFileSelect(file._id)}
                    sx={{
                      borderRadius: 1,
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(12, 74, 110, 0.05)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#0c4a6e" }}>
                      <FileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: "#0c4a6e", fontWeight: 500 }}>
                          {file.originalName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Uploaded: {new Date(file.createdAt).toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography sx={{ color: "#64748b" }}>
                No files uploaded yet. Upload your first file above.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default FileUpload;
