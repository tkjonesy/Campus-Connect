import React, { useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Login.css';
import { useAuth } from './AuthContext';
import logo from './assets/campusconnect.svg';
import { useNavigate } from 'react-router-dom';

function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuthState } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        // Stop form from refreshing page
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log('Login response data:', data);

            // Store JWT token in local storage
            localStorage.setItem('token', data.token);

            // Decode the token to get the user data
            const decodedToken = jwtDecode(data.token);

            // Set Auth context with user data and token
            setAuthState({
                isAuthenticated: true,
                user: {
                    userId: decodedToken.userId,
                    username: decodedToken.username,
                    role: decodedToken.role,
                    uniID: decodedToken.uniID,
                }
            });
            
            // Redirect user to homepage
            window.location.reload();

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="logo-container">
                <img src={logo} alt="CampusConnect Logo" className="logo" />
                <p className="website-name">CampusConnect</p>
            </div>
            <h2>Login</h2>

            {/* Show any errors */}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username} onChange={(e)=> {setUsername(e.target.value)}} name="username" required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e)=> {setPassword(e.target.value)}} name="password" required />
                </div>
                <button type="submit">Login</button>
            </form>
            <div className="reg-link">
                <a href="/register">Click Here to Register</a>
            </div>
        </div>
    );
}

export default Login