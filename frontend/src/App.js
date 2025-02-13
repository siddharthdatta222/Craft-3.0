import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import WorldContext from './components/WorldContext';
import ScriptEditor from './components/ScriptEditor';
import NodeArchitecture from './components/NodeArchitecture';
import SubscriptionManager from './components/SubscriptionManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Keep these routes but they won't be used for now */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Make dashboard accessible without auth */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/world" element={<WorldContext />} />
          <Route path="/editor" element={<ScriptEditor />} />
          <Route path="/nodes" element={<NodeArchitecture />} />
          <Route path="/subscriptions" element={<SubscriptionManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 