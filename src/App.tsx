/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import BypassPage from './pages/BypassPage';
import GetCodePage from './pages/GetCodePage';
import FallingFlowers from './components/FallingFlowers';
import Footer from './components/Footer';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/s/:shortId" element={<BypassPage />} />
        <Route path="/c/:sessionId" element={<GetCodePage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
        <FallingFlowers />
        <main className="flex-grow z-10 relative">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
