import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ScriptEditor from './ScriptEditor';
import NodeArchitecture from './NodeArchitecture';
import SubscriptionManager from './SubscriptionManager';

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    {/* Home route - shows the dashboard */}
                    <Route path="/" element={<Dashboard />} />
                    
                    {/* Script editor route */}
                    <Route path="/editor" element={<ScriptEditor />} />
                    
                    {/* Node architecture route */}
                    <Route path="/nodes" element={<NodeArchitecture />} />
                    
                    {/* Subscription manager route */}
                    <Route path="/subscriptions" element={<SubscriptionManager />} />
                    
                    {/* Catch all undefined routes and redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>

            <style jsx>{`
                .app {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                }
            `}</style>
        </BrowserRouter>
    );
}

export default App; 