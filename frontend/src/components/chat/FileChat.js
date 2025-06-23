import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";

const FileChat = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when history changes
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/files/my-files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
    } catch (err) {
      setError("Failed to fetch files");
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
    // Reset chat history when file changes
    setChatHistory([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedFile) return;
  
    // Add user message to chat
    const userMessage = { role: "user", content: message };
    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    setMessage("");
    setLoading(true);
    setError(""); // Clear any previous errors
  
    try {
      const token = localStorage.getItem("token");
      
      // Send message to our backend API using the new Gemini endpoint
      const response = await axiosInstance.post("/gemini/chat", {
        fileId: selectedFile,
        messages: [...chatHistory, userMessage]
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Check if the response has the expected structure
      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        // Add AI response to chat
        setChatHistory(prevHistory => [...prevHistory, { 
          role: "assistant", 
          content: response.data.choices[0].message.content 
        }]);
      } else {
        throw new Error("Invalid response format from Gemini API");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to process your request";
      setError(errorMessage);
      
      // Add error message to chat
      setChatHistory(prevHistory => [...prevHistory, { 
        role: "assistant", 
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "1px solid #bae6fd",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#0369a1", fontWeight: "bold" }}
        >
          Chat with Your Excel Data using Gemini AI
        </Typography>
        <Typography variant="body1" paragraph>
          Upload an Excel file, select it, and ask questions about your data. Our Gemini AI will analyze the data and provide insights.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.05)",
              height: "70vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* File Selection */}
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Excel File</InputLabel>
                <Select
                  value={selectedFile}
                  label="Select Excel File"
                  onChange={handleFileChange}
                >
                  <MenuItem value="">Select a file</MenuItem>
                  {files.map((file) => (
                    <MenuItem key={file._id} value={file._id}>
                      {file.originalName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Chat Messages */}
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                p: 2,
                backgroundColor: "#f8fafc",
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!selectedFile ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "text.secondary",
                  }}
                >
                  <AttachFileIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">
                    Select an Excel file to start chatting
                  </Typography>
                </Box>
              ) : chatHistory.length === 0 ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "text.secondary",
                  }}
                >
                  <BotIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">
                    Ask questions about your Excel data
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Examples: "What's the average value in column A?", "Summarize this data", "Find the highest value"
                  </Typography>
                </Box>
              ) : (
                <List>
                  {chatHistory.map((msg, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          backgroundColor:
                            msg.role === "user" ? "#f0f9ff" : "#f0fdf4",
                          borderRadius: 2,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            mr: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor:
                              msg.role === "user" ? "#0ea5e9" : "#16a34a",
                            color: "white",
                          }}
                        >
                          {msg.role === "user" ? (
                            <PersonIcon fontSize="small" />
                          ) : (
                            <BotIcon fontSize="small" />
                          )}
                        </Box>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {msg.role === "user" ? "You" : "Gemini AI Assistant"}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {msg.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < chatHistory.length - 1 && (
                        <Box sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  ))}
                  {loading && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        my: 2,
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </List>
              )}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid rgba(0,0,0,0.05)",
                backgroundColor: "white",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Ask a question about your data..."
                    variant="outlined"
                    size="small"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!selectedFile || loading}
                  />
                  <IconButton
                    color="primary"
                    type="submit"
                    disabled={!message.trim() || !selectedFile || loading}
                    sx={{
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      "&:hover": { backgroundColor: "#0284c7" },
                      "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </form>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default FileChat;