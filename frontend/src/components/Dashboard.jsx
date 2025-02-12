import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    // Simulated user authentication state
    const [user, setUser] = useState({
        username: "testuser",
        email: "test@example.com"
    });

    // State for scripts and loading status
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch scripts on component mount
    useEffect(() => {
        loadScripts();
    }, []);

    // Function to fetch scripts from backend
    const loadScripts = async () => {
        try {
            const response = await fetch('/api/scripts');
            const data = await response.json();
            setScripts(data);
            setLoading(false);
        } catch (error) {
            setError('Error loading scripts: ' + error.message);
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        setUser(null);
    };

    // If user is logged out, show login message
    if (!user) {
        return (
            <div className="dashboard logged-out">
                <h2>Please log in to access your dashboard</h2>
                <style jsx>{`
                    .logged-out {
                        text-align: center;
                        padding: 50px;
                        color: #666;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header Section */}
            <header>
                <div className="welcome">
                    <h1>Welcome, {user.username}!</h1>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            {/* Navigation Section */}
            <nav>
                <Link to="/editor" className="nav-btn">Script Editor</Link>
                <Link to="/nodes" className="nav-btn">Node Architecture</Link>
                <Link to="/subscriptions" className="nav-btn">Subscriptions</Link>
            </nav>

            {/* Scripts Section */}
            <section className="scripts-section">
                <h2>Your Scripts</h2>
                {loading ? (
                    <p>Loading scripts...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : scripts.length === 0 ? (
                    <p>No scripts found. Start creating!</p>
                ) : (
                    <div className="scripts-grid">
                        {scripts.map(script => (
                            <div key={script.id} className="script-card">
                                <h3>{script.title}</h3>
                                <p className="date">
                                    Created: {new Date(script.createdAt).toLocaleDateString()}
                                </p>
                                <div className="card-actions">
                                    <button className="edit-btn">
                                        Edit Script
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <style jsx>{`
                .dashboard {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                header {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .welcome {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                nav {
                    margin-bottom: 30px;
                    display: flex;
                    gap: 15px;
                }

                .nav-btn {
                    padding: 12px 24px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .nav-btn:hover {
                    background-color: #0056b3;
                }

                .logout-btn {
                    padding: 8px 16px;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .logout-btn:hover {
                    background-color: #c82333;
                }

                .scripts-section {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .scripts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .script-card {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .script-card h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                }

                .date {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 15px;
                }

                .card-actions {
                    display: flex;
                    justify-content: flex-end;
                }

                .edit-btn {
                    padding: 8px 16px;
                    background-color: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .edit-btn:hover {
                    background-color: #218838;
                }

                .error {
                    color: #dc3545;
                    padding: 10px;
                    background-color: #f8d7da;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default Dashboard; 