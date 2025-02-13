import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';

function Dashboard() {
    const [activeScript, setActiveScript] = useState(null);
    const [scripts, setScripts] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

    const fetchScripts = useCallback(async () => {
        console.log('Fetching scripts...');
        try {
            const response = await fetch(`${API_URL}/api/scripts`);
            console.log('Scripts response:', response);

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched scripts:', data);
                setScripts(data);
            } else {
                console.error('Failed to fetch scripts:', response.status);
                setError(`Failed to fetch scripts: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching scripts:', err);
            setError('Failed to fetch scripts');
        }
    }, [API_URL]);

    useEffect(() => {
        fetchScripts();
    }, [fetchScripts]);

    const handleAddContext = async () => {
        console.log('Add Context clicked');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/world`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'New Context',
                    description: ''
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to add context: ${response.status}`);
            }

            const data = await response.json();
            console.log('Context added:', data);
        } catch (err) {
            console.error('Error adding context:', err);
            setError(err.message || 'Failed to add context');
        } finally {
            setIsLoading(false);
        }
    };

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
                                onClick={handleAddContext} 
                                className="add-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Adding...' : '+ Add Context'}
                            </button>
                        </div>
                        {/* Add other sections similarly */}
                    </div>
                </div>

                <div className="right-panel">
                    <div className="panel-header">
                        <h3>Script Editor</h3>
                        <button className="new-script-btn">+ New Script</button>
                    </div>
                    <div className="panel-content">
                        {activeScript ? (
                            <div className="script-editor">
                                {/* Script editor content */}
                            </div>
                        ) : (
                            <div className="no-script">
                                <p>Create a new script or select an existing one to begin writing.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 