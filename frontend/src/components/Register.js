import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

    // Test backend connection on component mount
    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('Testing backend connection...');
                const response = await fetch(`${API_URL}/api/test`);
                const data = await response.json();
                console.log('Backend test response:', data);
            } catch (err) {
                console.error('Backend connection test failed:', err);
                setError('Backend connection failed');
            }
        };

        testConnection();
    }, [API_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Making registration request to:', `${API_URL}/api/auth/register`);
            console.log('With data:', { ...formData, password: '[HIDDEN]' });

            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            console.log('Registration response:', response);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Registration failed:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Registration successful:', data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', formData.username);

            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error details:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && (
                <div className="error-message">
                    {error}
                    <br />
                    <small>API URL: {API_URL}</small>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>
                <button 
                    type="submit" 
                    className="register-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}

export default Register; 