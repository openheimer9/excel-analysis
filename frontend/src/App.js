import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import FileUpload from './components/files/FileUpload';
import FileHistory from './components/files/FileHistory';
import Analysis from './components/analysis/Analysis';
import FileChat from './components/chat/FileChat';
import AdminDashboard from './components/admin/AdminDashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import SidebarLayout from './components/layout/SidebarLayout';

// ✅ Updated navy-blue theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0c4a6e', // navy blue color
    },
    secondary: {
      main: '#6b7280', // gray-500
    },
    chart: {
      green: '#16a34a',
      blue: '#0284c7',
      purple: '#7e22ce',
      orange: '#ea580c',
      red: '#dc2626'
    }
  },
});

function App() {
  return (
    

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="min-h-screen text-gray-800">
            

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <SidebarLayout>
                    <Dashboard />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <SidebarLayout>
                    <FileUpload />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/file-history"
              element={
                <PrivateRoute>
                  <SidebarLayout>
                    <FileHistory />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analysis/:fileId"
              element={
                <PrivateRoute>
                  <SidebarLayout>
                    <Analysis />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <SidebarLayout>
                    <FileChat />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <SidebarLayout>
                    <AdminDashboard />
                  </SidebarLayout>
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
