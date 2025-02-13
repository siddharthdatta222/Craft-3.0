import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h2>Craft 3.0</h2>
                <div className="nav-right">
                    <span>Welcome, Writer!</span>
                </div>
            </nav>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="dashboard-content">
                <div className="left-panel">
                    <div className="panel-header">
                        <h3>Story Elements</h3>
                    </div>
                    <div className="panel-content">
                        <div className="story-section">
                            <h4>World Context</h4>
                            <button 
                                onClick={() => navigate('/nodes')} 
                                className="add-btn"
                            >
                                Open Node Editor
                            </button>
                        </div>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="panel-header">
                        <h3>Script Editor</h3>
                        <button className="new-script-btn">+ New Script</button>
                    </div>
                    <div className="panel-content">
                        <div className="no-script">
                            <p>Create a new script or select an existing one to begin writing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 