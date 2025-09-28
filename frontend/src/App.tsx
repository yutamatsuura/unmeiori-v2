import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import LoginPage from './pages/Login';
import CreatePage from './pages/Create';
import PreviewPage from './pages/Preview';
import HistoryPage from './pages/History';
import SettingsPage from './pages/Settings';

// カスタムテーマ
const theme = createTheme({
  palette: {
    primary: {
      main: '#34495e',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#bdc3c7'
    },
    success: {
      main: '#16a085'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", sans-serif'
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
