import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorldContext from './components/WorldContext';
import ScriptEditor from './components/ScriptEditor';
import NodeArchitecture from './components/NodeArchitecture';
import SubscriptionManager from './components/SubscriptionManager';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/world" element={<WorldContext />} />
        <Route path="/editor" element={<ScriptEditor />} />
        <Route path="/nodes" element={<NodeArchitecture />} />
        <Route path="/subscriptions" element={<SubscriptionManager />} />
      </Routes>
    </div>
  );
}

export default App; 