import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [activeScript, setActiveScript] = useState(null);
    const [scripts, setScripts] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // API base URL
    const API_URL = 'http://localhost:3002/api';

    useEffect(() => {
        console.log('Dashboard mounted');
        console.log('Stored token:', localStorage.getItem('token'));
        fetchScripts();
    }, []);

    const fetchScripts = async () => {
        console.log('Fetching scripts...');
        try {
            const token = localStorage.getItem('token');
            console.log('Using token:', token);

            const response = await fetch(`${API_URL}/scripts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
    };

    const handleAddContext = async () => {
        console.log('Add Context clicked');
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Making request to:', `${API_URL}/world`);
            
            const response = await fetch(`${API_URL}/world`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: 'New Context',
                    description: ''
                })
            });

            const data = await response.json(); // Get the error message if any
            console.log('Add Context response:', response.status, data);

            if (response.ok) {
                console.log('Context added successfully:', data);
            } else {
                throw new Error(data.error || 'Failed to add context');
            }
        } catch (err) {
            console.error('Error adding context:', err);
            setError(err.message || 'Failed to add context');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCharacter = async () => {
        console.log('Add Character clicked');
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Making request to:', `${API_URL}/characters`);

            const response = await fetch(`${API_URL}/characters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: 'New Character',
                    description: ''
                })
            });
            console.log('Add Character response:', response);

            if (response.ok) {
                const data = await response.json();
                console.log('Character added:', data);
            } else {
                console.error('Failed to add character:', response.status);
                setError(`Failed to add character: ${response.status}`);
            }
        } catch (err) {
            console.error('Error adding character:', err);
            setError('Failed to add character');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRelationship = async () => {
        try {
            const response = await fetch(`${API_URL}/relationships`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    character1Id: '',
                    character2Id: '',
                    relationshipType: ''
                })
            });
            if (response.ok) {
                // Handle success
                console.log('Relationship added successfully');
            }
        } catch (err) {
            console.error('Error adding relationship:', err);
            setError('Failed to add relationship');
        }
    };

    const handleNewScript = async () => {
        try {
            const response = await fetch(`${API_URL}/scripts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: 'New Script',
                    content: ''
                })
            });
            if (response.ok) {
                const newScript = await response.json();
                setActiveScript(newScript);
                fetchScripts(); // Refresh scripts list
            }
        } catch (err) {
            console.error('Error creating script:', err);
            setError('Failed to create script');
        }
    };

    const handleLogout = () => {
        console.log('Logout clicked');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    // Check if token exists and is being sent correctly
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    return (
        <div className="dashboard-container">
            {/* Top Navigation */}
            <nav className="dashboard-nav">
                <h2>Craft 3.0</h2>
                <div className="nav-right">
                    <span>Welcome, {username || 'Writer'}!</span>
                    <button 
                        onClick={handleLogout} 
                        className="logout-btn"
                        disabled={isLoading}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    margin: '10px',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Left Panel - Narrative Architecture */}
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
                        <div className="story-section">
                            <h4>Characters</h4>
                            <button 
                                onClick={handleAddCharacter} 
                                className="add-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Adding...' : '+ Add Character'}
                            </button>
                        </div>
                        <div className="story-section">
                            <h4>Relationships</h4>
                            <button onClick={handleAddRelationship} className="add-btn">+ Add Relationship</button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Script Writing */}
                <div className="right-panel">
                    <div className="panel-header">
                        <h3>Script Editor</h3>
                        <button onClick={handleNewScript} className="new-script-btn">+ New Script</button>
                    </div>
                    <div className="panel-content">
                        {activeScript ? (
                            <div className="script-editor">
                                <textarea 
                                    value={activeScript.content}
                                    onChange={(e) => setActiveScript({
                                        ...activeScript,
                                        content: e.target.value
                                    })}
                                    placeholder="Start writing your script..."
                                    className="script-textarea"
                                />
                            </div>
                        ) : (
                            <div className="no-script-selected">
                                <h3>No Script Selected</h3>
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