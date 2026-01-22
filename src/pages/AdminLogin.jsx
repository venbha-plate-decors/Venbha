import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { signIn, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/admin_dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error: signInError } = await signIn(formData.email, formData.password);

            if (signInError) {
                setError(signInError.message || 'Invalid email or password');
                setIsLoading(false);
                return;
            }

            if (data.user) {
                // Successfully logged in, reset dashboard tab to overview
                localStorage.setItem('adminActiveTab', 'dashboard');
                console.log('Login successful:', data.user);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <Helmet>
                <title>Admin Login | Venbha Plate Decors</title>
            </Helmet>
            {/* Background elements */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="login-header">
                    <h2>Admin Login</h2>
                    <p>Welcome back! Please access the dashboard.</p>
                </div>

                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            border: '1px solid #fcc'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="admin@venbha.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password-btn text-only"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="login-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            "Login"
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
