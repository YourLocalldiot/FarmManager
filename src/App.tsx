import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import BioPass from './pages/BioPass';
import BioPassWizard from './pages/BioPass/BioPassWizard';
import QuantitativeAgent from './pages/QuantitativeAgent';
import AgriSalvager from './pages/AgriSalvager';
import Future from './pages/Future';
import ProfilePage from './pages/Profile';
import { AppThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="biopass" element={<BioPass />} />
              <Route path="biopass/new" element={<BioPassWizard />} />
              <Route path="biopass/:id" element={<BioPassWizard />} />
              <Route path="agent" element={<QuantitativeAgent />} />
              <Route path="salvager" element={<AgriSalvager />} />
              <Route path="future" element={<Future />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;
