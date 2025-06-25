import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  ArcElement,
  RadialLinearScale,
  RadarController,
  PointStyle,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Radar, Scatter, Bubble } from "react-chartjs-2";
import Plot from "react-plotly.js";
import axiosInstance from "../../api/axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  Download as DownloadIcon,
  Save as SaveIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  BubbleChart as BubbleChartIcon,
  ViewInAr as ThreeDIcon,
} from "@mui/icons-material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  RadialLinearScale,
  RadarController,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Chart type definitions with their dimension requirements
const CHART_TYPES = {
  // 2D Charts 
  line: { name: "Line Chart", dimensions: "2D", axes: { x: true, y: true } },
  bar: { name: "Bar Chart", dimensions: "2D", axes: { x: true, y: true } },
  horizontalBar: { name: "Horizontal Bar Chart", dimensions: "2D", axes: { x: true, y: true } },
  pie: { name: "Pie Chart", dimensions: "2D", axes: { x: false, y: true, label: true } },
  doughnut: { name: "Doughnut Chart", dimensions: "2D", axes: { x: false, y: true, label: true } },
  radar: { name: "Radar Chart", dimensions: "2D", axes: { x: false, y: true, categories: true } },
  scatter: { name: "Scatter Plot", dimensions: "2D", axes: { x: true, y: true } },
  bubble: { name: "Bubble Chart", dimensions: "2D", axes: { x: true, y: true, size: true } },
  
  // 3D Charts
  scatter3d: { name: "3D Scatter Plot", dimensions: "3D", axes: { x: true, y: true, z: true } },
  surface: { name: "3D Surface Plot", dimensions: "3D", axes: { x: true, y: true, z: true } },
  mesh3d: { name: "3D Mesh Plot", dimensions: "3D", axes: { x: true, y: true, z: true } },
  line3d: { name: "3D Line Plot", dimensions: "3D", axes: { x: true, y: true, z: true } },
};

// Add this near the top of the component function
const Analysis = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get chart parameters from URL query
  const queryParams = new URLSearchParams(location.search);
  const initialChartType = queryParams.get('chartType') || 'line';
  const initialDimension = queryParams.get('dimension') || '2D';
  
  // Update state initializations
  const [fileData, setFileData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [selectedZ, setSelectedZ] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCategories, setSelectedCategories] = useState("");
  const [chartType, setChartType] = useState(initialChartType);
  const [dimensionTab, setDimensionTab] = useState(initialDimension);
  const [error, setError] = useState("");
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("png");
  const [chartColor, setChartColor] = useState('green');
  
  // Add these color options inside the component
  const colorOptions = [
    { name: 'Green', value: 'green', color: '#16a34a' },
    { name: 'Blue', value: 'blue', color: '#0284c7' },
    { name: 'Purple', value: 'purple', color: '#7e22ce' },
    { name: 'Orange', value: 'orange', color: '#ea580c' },
    { name: 'Red', value: 'red', color: '#dc2626' },
    { name: 'Teal', value: 'teal', color: '#0d9488' },
    { name: 'Indigo', value: 'indigo', color: '#4f46e5' },
    { name: 'Pink', value: 'pink', color: '#db2777' }
  ];

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  useEffect(() => {
    if (fileData && headers.length > 0) {
      setSelectedX(headers[0]);
      setSelectedY(headers[1]);
      if (headers.length > 2) {
        setSelectedZ(headers[2]);
        setSelectedLabel(headers[0]);
        setSelectedSize(headers[2]);
        setSelectedCategories(headers[0]);
      }
    }
  }, [fileData, headers]);

  // Reset axis selections when chart type changes
  useEffect(() => {
    const chartConfig = CHART_TYPES[chartType];
    if (chartConfig && chartConfig.dimensions !== dimensionTab) {
      setDimensionTab(chartConfig.dimensions);
    }
  }, [chartType]);

  const fetchFileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/files/${fileId}/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFileData(response.data.data);
      setHeaders(response.data.headers);
    } catch (err) {
      setError("Failed to fetch file data");
    }
  };

  const handleSaveAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/analysis/${fileId}`,
        { 
          chartType, 
          xAxis: selectedX, 
          yAxis: selectedY,
          zAxis: selectedZ,
          labelAxis: selectedLabel,
          sizeAxis: selectedSize,
          categoriesAxis: selectedCategories
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError("Failed to save analysis");
    }
  };

  const handleDimensionChange = (event, newValue) => {
    setDimensionTab(newValue);
    // Set default chart type for the selected dimension
    const chartTypesForDimension = Object.entries(CHART_TYPES)
      .filter(([_, config]) => config.dimensions === newValue)
      .map(([type]) => type);
    
    if (chartTypesForDimension.length > 0) {
      setChartType(chartTypesForDimension[0]);
    }
  };

  const prepareChartData = () => {
    if (!fileData || !selectedX || !selectedY) return null;

    // Sort data if needed
    const sortedData = [...fileData].sort((a, b) => {
      if (typeof a[selectedX] === 'number' && typeof b[selectedX] === 'number') {
        return a[selectedX] - b[selectedX];
      }
      return String(a[selectedX]).localeCompare(String(b[selectedX]));
    });

    const chartConfig = CHART_TYPES[chartType];
    
    // For pie/doughnut charts
    if (chartType === 'pie' || chartType === 'doughnut') {
      const labels = sortedData.map(item => item[selectedLabel]);
      const data = sortedData.map(item => item[selectedY]);
      
      return {
        labels,
        datasets: [{
          label: selectedY,
          data,
          backgroundColor: generateColors(data.length),
          borderColor: '#ffffff',
          borderWidth: 1,
        }],
      };
    }
    
    // For radar charts
    if (chartType === 'radar') {
      const labels = sortedData.map(item => item[selectedCategories]);
      const data = sortedData.map(item => item[selectedY]);
      
      // Get color based on selected chart color
      const colorObj = colorOptions.find(c => c.value === chartColor) || colorOptions[0];
      
      return {
        labels,
        datasets: [{
          label: selectedY,
          data,
          backgroundColor: `${colorObj.color}33`, // With transparency
          borderColor: colorObj.color,
          pointBackgroundColor: colorObj.color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: colorObj.color,
        }],
      };
    }
    
    // For bubble charts
    if (chartType === 'bubble') {
      // Get color based on selected chart color
      const colorObj = colorOptions.find(c => c.value === chartColor) || colorOptions[0];
      
      return {
        datasets: [{
          label: `${selectedY} vs ${selectedX}`,
          data: sortedData.map(item => ({
            x: item[selectedX],
            y: item[selectedY],
            r: item[selectedSize] / 5, // Scale down the size for better visualization
          })),
          backgroundColor: `${colorObj.color}80`, // With transparency
        }],
      };
    }
    
    // For scatter plots
    if (chartType === 'scatter') {
      // Get color based on selected chart color
      const colorObj = colorOptions.find(c => c.value === chartColor) || colorOptions[0];
      
      return {
        datasets: [{
          label: `${selectedY} vs ${selectedX}`,
          data: sortedData.map(item => ({
            x: item[selectedX],
            y: item[selectedY],
          })),
          backgroundColor: colorObj.color,
        }],
      };
    }
    
    // Default for line and bar charts
    const labels = sortedData.map(item => item[selectedX]);
    const data = sortedData.map(item => item[selectedY]);

    // Get color based on selected chart color
    const colorObj = colorOptions.find(c => c.value === chartColor) || colorOptions[0];

    return {
      labels,
      datasets: [
        {
          label: `${selectedY} vs ${selectedX}`,
          data,
          borderColor: colorObj.color,
          backgroundColor: `${colorObj.color}66`, // With transparency
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  // Move the generateColors function inside the component
  const generateColors = (count) => {
    const colors = [];
    let baseHue = 120; // Default green hue
    
    // Set base hue based on selected color
    switch(chartColor) {
      case 'blue': baseHue = 210; break;
      case 'purple': baseHue = 270; break;
      case 'orange': baseHue = 30; break;
      case 'red': baseHue = 0; break;
      default: baseHue = 120; // green
    }
    
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + (i * 137)) % 360; // Golden ratio to distribute colors
      colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    }
    
    return colors;
  };

  const handleDownloadClick = () => {
    setDownloadDialogOpen(true);
  };

  const handleDownloadClose = () => {
    setDownloadDialogOpen(false);
  };

  const handleDownloadChart = () => {
    setDownloadDialogOpen(false);
    
    const chartContainer = document.getElementById("chart-container");
    if (!chartContainer) return;

    if (downloadFormat === "png") {
      downloadAsPNG(chartContainer);
    } else if (downloadFormat === "pdf") {
      downloadAsPDF(chartContainer);
    }
  };

  const downloadAsPNG = (element) => {
    html2canvas(element, { scale: 2 }).then(canvas => {
      const link = document.createElement("a");
      link.download = `chart-${chartType}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const downloadAsPDF = (element) => {
    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`chart-${chartType}.pdf`);
    });
  };

  const renderChart = () => {
    const chartData = prepareChartData();
    if (!chartData) return null;

    const chartConfig = CHART_TYPES[chartType];
    if (!chartConfig) return null;

    // Common options for Chart.js charts
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: getChartTitle(),
          font: { size: 18 },
        },
      },
      scales: chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'radar' ? {
        x: {
          title: {
            display: true,
            text: selectedX,
          },
        },
        y: {
          title: {
            display: true,
            text: selectedY,
          },
        },
      } : undefined,
    };

    // For 3D charts using Plotly
    if (chartConfig.dimensions === "3D") {
      const x = fileData.map(item => item[selectedX]);
      const y = fileData.map(item => item[selectedY]);
      const z = fileData.map(item => item[selectedZ]);
    
      // Get color based on selected chart color
      const colorObj = colorOptions.find(c => c.value === chartColor) || colorOptions[0];
      // Convert to a colorscale name that Plotly understands
      const colorscaleMap = {
        green: "Greens",
        blue: "Blues",
        purple: "Purples",
        orange: "Oranges",
        red: "Reds",
        teal: "Teal",
        indigo: "Purples",
        pink: "Pinkyl"
      };
      const colorscale = colorscaleMap[chartColor] || "Viridis";
    
      let plotlyData = [];
      let layout = {
        margin: { l: 0, r: 0, b: 0, t: 30 },
        height: 500,
        title: getChartTitle(),
        scene: {
          xaxis: { title: selectedX },
          yaxis: { title: selectedY },
          zaxis: { title: selectedZ },
        },
      };
    
      switch (chartType) {
        case "scatter3d":
          plotlyData = [{
            x, y, z,
            mode: "markers",
            type: "scatter3d",
            marker: { size: 4, color: z, colorscale: colorscale },
          }];
          break;
          
        case "surface":
          // Create a grid for surface plot
          const uniqueX = [...new Set(x)].sort((a, b) => a - b);
          const uniqueY = [...new Set(y)].sort((a, b) => a - b);
          const zGrid = Array(uniqueY.length).fill().map(() => Array(uniqueX.length).fill(null));
          
          fileData.forEach(item => {
            const xIndex = uniqueX.indexOf(item[selectedX]);
            const yIndex = uniqueY.indexOf(item[selectedY]);
            if (xIndex >= 0 && yIndex >= 0) {
              zGrid[yIndex][xIndex] = item[selectedZ];
            }
          });
          
          plotlyData = [{
            z: zGrid,
            x: uniqueX,
            y: uniqueY,
            type: "surface",
            colorscale: colorscale,
          }];
          break;
          
        case "mesh3d":
          plotlyData = [{
            x, y, z,
            type: "mesh3d",
            colorscale: colorscale,
            intensity: z,
            opacity: 0.8,
          }];
          break;
          
        case "line3d":
          plotlyData = [{
            x, y, z,
            mode: "lines",
            type: "scatter3d",
            line: {
              color: z,
              colorscale: colorscale,
              width: 4,
            },
          }];
          break;
      }

      return (
        <Plot
          data={plotlyData}
          layout={layout}
          config={{ responsive: true }}
          divId="plotly-chart"
        />
      );
    }

    // For 2D charts using Chart.js
    switch (chartType) {
      case "line":
        return <Line data={chartData} options={options} />;
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "horizontalBar":
        return <Bar data={chartData} options={{ ...options, indexAxis: 'y' }} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      case "doughnut":
        return <Pie data={chartData} options={options} type="doughnut" />;
      case "radar":
        return <Radar data={chartData} options={options} />;
      case "scatter":
        return <Scatter data={chartData} options={options} />;
      case "bubble":
        return <Bubble data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  const getChartTitle = () => {
    const chartConfig = CHART_TYPES[chartType];
    if (!chartConfig) return "Chart";

    if (chartConfig.dimensions === "3D") {
      return `${selectedZ} vs ${selectedY} vs ${selectedX} (${chartConfig.name})`;
    }

    if (chartType === 'pie' || chartType === 'doughnut') {
      return `${selectedY} by ${selectedLabel} (${chartConfig.name})`;
    }

    if (chartType === 'radar') {
      return `${selectedY} by ${selectedCategories} (${chartConfig.name})`;
    }

    if (chartType === 'bubble') {
      return `${selectedY} vs ${selectedX} with ${selectedSize} (${chartConfig.name})`;
    }

    return `${selectedY} vs ${selectedX} (${chartConfig.name})`;
  };

  return (
    <Container maxWidth="lg" className="animate-fadeIn" sx={{ mt: 6, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              background: "linear-gradient(to right, #ffffff, #f9fafb)",
            }}
            className="hover:shadow-xl transition-shadow duration-300"
          >
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              className="text-blue-700 font-bold"
            >
              Data Analysis
            </Typography>

            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}

            {/* Chart Type Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chart Type
              </Typography>
              <Tabs
                value={dimensionTab}
                onChange={handleDimensionChange}
                sx={{ mb: 2 }}
              >
                <Tab value="2D" label="2D Charts" />
                <Tab value="3D" label="3D Charts" />
              </Tabs>
              
              <Grid container spacing={1}>
                {Object.entries(CHART_TYPES)
                  .filter(([_, config]) => config.dimensions === dimensionTab)
                  .map(([type, config]) => (
                    <Grid item key={type}>
                      <Button
                        variant={chartType === type ? "contained" : "outlined"}
                        onClick={() => setChartType(type)}
                        startIcon={
                          type.includes('3d') ? <ThreeDIcon /> :
                          type.includes('bar') ? <BarChartIcon /> :
                          type.includes('line') ? <LineChartIcon /> :
                          type.includes('pie') || type.includes('doughnut') ? <PieChartIcon /> :
                          <BubbleChartIcon />
                        }
                        sx={{ 
                          m: 0.5,
                          backgroundColor: chartType === type ? "#0c4a6e" : "transparent",
                          '&:hover': { backgroundColor: chartType === type ? "#0c4a6e" : "rgba(22, 163, 74, 0.08)" }
                        }}
                      >
                        {config.name}
                      </Button>
                    </Grid>
                  ))}
              </Grid>
            </Box>

            {/* Chart Color Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chart Color Theme
              </Typography>
              <Grid container spacing={1}>
                {colorOptions.map((option) => (
                  <Grid item key={option.value}>
                    <Button
                      variant={chartColor === option.value ? "contained" : "outlined"}
                      onClick={() => setChartColor(option.value)}
                      sx={{ 
                        m: 0.5,
                        backgroundColor: chartColor === option.value ? option.color : "transparent",
                        color: chartColor === option.value ? "white" : option.color,
                        borderColor: option.color,
                        '&:hover': { 
                          backgroundColor: chartColor === option.value ? option.color : `${option.color}22`,
                          borderColor: option.color
                        }
                      }}
                    >
                      {option.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Axis Selection */}
            <Typography variant="subtitle1" gutterBottom>
              Data Selection
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* X Axis - for most chart types */}
              {CHART_TYPES[chartType]?.axes?.x && (
                <Grid item xs={12} sm={dimensionTab === "3D" ? 4 : 6}>
                  <FormControl fullWidth>
                    <InputLabel>X Axis</InputLabel>
                    <Select
                      value={selectedX}
                      label="X Axis"
                      onChange={(e) => setSelectedX(e.target.value)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Y Axis - for most chart types */}
              {CHART_TYPES[chartType]?.axes?.y && (
                <Grid item xs={12} sm={dimensionTab === "3D" ? 4 : 6}>
                  <FormControl fullWidth>
                    <InputLabel>Y Axis</InputLabel>
                    <Select
                      value={selectedY}
                      label="Y Axis"
                      onChange={(e) => setSelectedY(e.target.value)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Z Axis - for 3D charts */}
              {CHART_TYPES[chartType]?.axes?.z && (
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Z Axis</InputLabel>
                    <Select
                      value={selectedZ}
                      label="Z Axis"
                      onChange={(e) => setSelectedZ(e.target.value)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Label Axis - for pie/doughnut charts */}
              {CHART_TYPES[chartType]?.axes?.label && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Label Field</InputLabel>
                    <Select
                      value={selectedLabel}
                      label="Label Field"
                      onChange={(e) => setSelectedLabel(e.target.value)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Size Axis - for bubble charts */}
              {CHART_TYPES[chartType]?.axes?.size && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Size Field</InputLabel>
                    <Select
                      value={selectedSize}
                      label="Size Field"
                      onChange={(e) => setSelectedSize(e.target.value)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Categories Axis - for radar charts */}
              {CHART_TYPES[chartType]?.axes?.categories && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categories Field</InputLabel>
                    <Select
                      value={selectedCategories}
                      label="Categories Field"
                      onChange={(e) => setSelectedCategories(e.target.value)}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* Chart Section */}
            <Box 
              id="chart-container"
              sx={{ 
                height: 500, 
                mb: 2,
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2,
                backgroundColor: '#ffffff'
              }}
            >
              {renderChart()}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSaveAnalysis}
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: "#0c4a6e",
                  '&:hover': { backgroundColor: "#0c4a6e" }
                }}
              >
                Save Analysis
              </Button>
              <Button
                variant="outlined"
                onClick={handleDownloadClick}
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: "#0c4a6e",
                  color: "#0c4a6e",
                  '&:hover': { borderColor: "#0c4a6e", backgroundColor: "rgba(22, 163, 74, 0.08)" }
                }}
              >
                Download Chart
              </Button>
            </Box>
            
            {/* Download Dialog */}
            <Dialog open={downloadDialogOpen} onClose={handleDownloadClose}>
              <DialogTitle>Download Chart</DialogTitle>
              <DialogContent>
                <Typography variant="body1" gutterBottom>
                  Select download format:
                </Typography>
                <RadioGroup
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <FormControlLabel value="png" control={<Radio />} label="PNG Image" />
                  <FormControlLabel value="pdf" control={<Radio />} label="PDF Document" />
                </RadioGroup>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDownloadClose}>Cancel</Button>
                <Button 
                  onClick={handleDownloadChart} 
                  variant="contained"
                  sx={{ backgroundColor: "#0c4a6e" }}
                >
                  Download
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analysis;
