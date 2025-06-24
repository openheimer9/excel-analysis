import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from "@mui/material";
import { Person, Lock } from "@mui/icons-material";
import axiosInstance from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user", // Default role is user
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 25px 25px, rgba(12, 74, 110, 0.03) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(12, 74, 110, 0.02) 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          opacity: 0.5,
          pointerEvents: "none",
        },
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 0 20px rgba(0,0,0,0.05) inset",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(12, 74, 110, 0.1)",
            transform: "perspective(1000px) rotateX(0deg)",
            transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
            "&:hover": {
              transform: "perspective(1000px) rotateX(2deg) translateY(-5px)",
              boxShadow: "0 15px 50px rgba(0,0,0,0.15), 0 0 20px rgba(0,0,0,0.05) inset",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              background: "linear-gradient(90deg, #0c4a6e, #1e40af)",
            },
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            sx={{ 
              fontWeight: "600", 
              color: "#0c4a6e", 
              mb: 3,
              textShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}
          >
            Login
          </Typography>

          {error && (
            <Typography
              color="error"
              align="center"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: "#0c4a6e" }}>
              Email Id
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Enter your email id"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#0c4a6e" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 0,
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  boxShadow: "0 2px 5px rgba(12,74,110,0.08) inset",
                  transition: "all 0.3s",
                  "&.Mui-focused": {
                    boxShadow: "0 2px 8px rgba(12,74,110,0.15) inset",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0c4a6e",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#0c4a6e",
                  },
                },
              }}
            />

            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: "#0c4a6e" }}>
              Password
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Type your password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#0c4a6e" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 0,
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  boxShadow: "0 2px 5px rgba(12,74,110,0.08) inset",
                  transition: "all 0.3s",
                  "&.Mui-focused": {
                    boxShadow: "0 2px 8px rgba(12,74,110,0.15) inset",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0c4a6e",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#0c4a6e",
                  },
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: "#0c4a6e",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#1e40af",
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
              <FormLabel component="legend" sx={{ color: "#0c4a6e" }}>
                Login As
              </FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="user"
                  control={<Radio sx={{ color: "#0c4a6e", '&.Mui-checked': { color: "#0c4a6e" } }} />}
                  label="User"
                />
                <FormControlLabel
                  value="admin"
                  control={<Radio sx={{ color: "#0c4a6e", '&.Mui-checked': { color: "#0c4a6e" } }} />}
                  label="Admin"
                />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                mt: 1,
                mb: 3,
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "0.9rem",
                letterSpacing: 1,
                borderRadius: 2,
                background: "linear-gradient(90deg, #0c4a6e 0%, #1e40af 100%)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2), 0 -2px 0px rgba(255,255,255,0.2) inset, 0 2px 0px rgba(0,0,0,0.2) inset",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0))",
                  clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 60%)",
                },
                "&:hover": {
                  background: "linear-gradient(90deg, #0c4a6e 20%, #1e40af 100%)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3), 0 -2px 0px rgba(255,255,255,0.2) inset, 0 2px 0px rgba(0,0,0,0.2) inset",
                  transform: "translateY(-2px)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                },
              }}
            >
              LOGIN
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{
                  color: "#0c4a6e",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#1e40af",
                  },
                }}
              >
                SIGN UP
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
