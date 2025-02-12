import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [scripts, setScripts] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch scripts');
      }

      const data = await response.json();
      // Ensure data is an array, if not, convert it or use empty array
      setScripts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scripts:', err);
      setError('Error loading scripts');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!localStorage.getItem('token')) {
    return <div>Please log in to access your dashboard</div>;
  }

  if (loading) return <div>Loading scripts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      
      <nav>
        <Link to="/editor">Script Editor</Link>
        <Link to="/nodes">Node Architecture</Link>
        <Link to="/subscriptions">Subscriptions</Link>
      </nav>

      <div>
        {scripts.length === 0 ? (
          <p>No scripts found. Start creating!</p>
        ) : (
          <ul>
            {scripts.map(script => (
              <li key={script._id}>
                {script.title}
                <p>Created: {new Date(script.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 