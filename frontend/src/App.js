import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeamInterface from './components/TeamInterface';
import AdminInterface from './components/AdminInterface';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TeamInterface />} />
          <Route path="/admin/*" element={<AdminInterface />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 