import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import BioPass from './pages/BioPass';
import QuantitativeAgent from './pages/QuantitativeAgent';
import AgriSalvager from './pages/AgriSalvager';
import Future from './pages/Future';
import { AppThemeProvider } from './theme/ThemeContext';

function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="biopass" element={<BioPass />} />
            <Route path="quant" element={<QuantitativeAgent />} />
            <Route path="salvager" element={<AgriSalvager />} />
            <Route path="future" element={<Future />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppThemeProvider>
  );
}

export default App;
