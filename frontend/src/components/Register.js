import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Sending registration request...');
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (data.status === 'success') {
                // Save token
                localStorage.setItem('token', data.data.token);
                console.log('Registration successful, redirecting...');
                navigate('/dashboard');
            } else {
                throw new Error(data.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        minLength="6"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <div className="status-message">
                {loading ? 'Processing...' : 'Ready'}
            </div>
        </div>
    );
}

export default Register; 