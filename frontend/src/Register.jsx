import React, { useEffect, useState } from 'react';
import './Register.css';
import logo from './assets/campusconnect.svg';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        username: '',
        password: '',
        confpassword: '',
        university: '',
        uniID: null,
        role: 'user'
    });

    const [universities, setUniversity] = useState([]);
    const [filteredUnis, setFilteredUnis] = useState([]);
    const [showDropDown, setShowDropDown] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { setAuthState } = useAuth();

    useEffect(() => {
        fetch('/api/universities')
            .then((response) => response.json())
            .then((data) => setUniversity(data))
            .catch((error) => console.error('Error fetching universities:', error));
        }, []);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        // Update university list based on search
        if (e.target.name === 'university') {
            const searchTerm = e.target.value;

            if (searchTerm === '') {
                setFilteredUnis([]);
                setShowDropDown(false);
            }

            else {
                const filtered = universities.filter(uni =>
                    uni.Name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredUnis(filtered);
                setShowDropDown(filtered.length > 0);
            }
        }
    };

    const handleSelectionUni = (uni) => {
        setFormData({ ...formData, university: uni.Name, uniID: uni.UniversityID });
        setShowDropDown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check that passwords match
        if (formData.password !== formData.confpassword) {
            setError('Passwords do not match');
            return;
        }

        // Ensure email ends in .edu
        if (!formData.email.endsWith('.edu')) {
            setError('Email must be university email');
            return;
        }

        // Make sure a valid university is selected
        if (!formData.uniID) {
            setError('A valid university must be selected');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

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
            navigate('/home');
        }

        catch (error) {
            console.error('Registration error:', error);
            setError('Registration failed');
        }
    };

    return (
        <div className="register-container">
            <div className="logo-container">
                <a href='/'>
                    <img src={logo} alt="CampusConnect Logo" className="logo" />
                </a>
                <p className="website-name">CampusConnect</p>
            </div>
            <h2>Register</h2>

            {/* Show any errors */}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="fname">First Name</label>
                    <input type="text" id="fname" name="fname" maxLength="50" required onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="lname">Last Name</label>
                    <input type="text" id="lname" name="lname" maxLength="50" required onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" maxLength="50" required onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" maxLength="20" required onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="confpassword">Confirm Password</label>
                    <input type="password" id="confpassword" name="confpassword" required onChange={handleChange} />
                </div>
                <div className="input-group university-select">
                    <label htmlFor="university">University</label>
                    <input 
                        type="text" 
                        id="university" 
                        name="university" 
                        placeholder="Search for a university..." 
                        value={formData.university}
                        onChange={handleChange} 
                        onFocus={() => setShowDropDown(filteredUnis.length > 0)}
                    />
                    {showDropDown && (
                        <ul className="dropdown">
                            {filteredUnis.map((uni) => (
                                <li key={uni.UniversityID} onClick={() => handleSelectionUni(uni)}>
                                    {uni.Name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
