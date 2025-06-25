import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  CloudDownload as DownloadIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";

const FileHistory = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  // Filter files when search term or files change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFiles(files);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = files.filter(file => {
      return (
        file.originalName.toLowerCase().includes(lowercasedSearch) ||
        new Date(file.uploadDate).toLocaleDateString().includes(lowercasedSearch)
      );
    });
    
    setFilteredFiles(filtered);
  }, [searchTerm, files]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/files/my-files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
      setFilteredFiles(response.data);
    } catch (err) {
      setError("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      
      // Create a download link 
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download file");
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/files/${fileToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update the files list
      setFiles(files.filter(file => file._id !== fileToDelete._id));
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
            }}
          >
            <HistoryIcon sx={{ color: "#0c4a6e", fontSize: 28 }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#0c4a6e" }}
            >
              File History
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(to bottom right, #ffffff, #f5f7fa)",
            }}
          >
            {error && (
              <Typography color="error" gutterBottom textAlign="center">
                {error}
              </Typography>
            )}

            {/* Search Box */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search files by name or date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#0c4a6e" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0c4a6e',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0c4a6e',
                    },
                  }
                }}
              />
            </Box>

            {loading ? (
              <Typography align="center" sx={{ py: 3 }}>
                Loading your files...
              </Typography>
            ) : (
              <List>
                {filteredFiles.map((file, index) => (
                  <React.Fragment key={file._id}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Download File">
                            <IconButton
                              onClick={() => handleDownload(file._id, file.originalName)}
                              sx={{
                                color: "#0c4a6e",
                                "&:hover": { backgroundColor: "rgba(21, 128, 61, 0.08)" },
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete File">
                            <IconButton
                              onClick={() => handleDeleteClick(file)}
                              sx={{
                                color: "#dc2626",
                                "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.08)" },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemText
                        primaryTypographyProps={{
                          fontWeight: "bold",
                          color: "#0c4a6e",
                        }}
                        primary={file.originalName}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              Uploaded on: {new Date(file.uploadDate).toLocaleDateString()}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Size: {(file.size / 1024).toFixed(2)} KB
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < filteredFiles.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}

                {filteredFiles.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={searchTerm ? "No matching files found" : "No files uploaded yet"}
                      secondary={searchTerm ? "Try a different search term" : "Upload files from the dashboard to see your history"}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fileToDelete?.originalName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FileHistory;
