import React, { useState, useEffect } from 'react';
import "./Header.css";
import MyRSOsDropdown from './RSOsDropdown';
import logo from "./assets/campusconnect.svg";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const { logout, user, isAuthLoaded } = useAuth();
    const location = useLocation();
    const showHeader = !['/login', '/register'].includes(location.pathname);



    return (
        <>
        {showHeader && (
            <header className="header">
                <div className="logo-container">
                    <img src={logo} alt="CampusConnect Logo" className="logo" />
                    <a href="/home">CampusConnect</a>
                </div>

                <nav className="nav-links">
                    {user && <MyRSOsDropdown />}
                    {user?.role === 'admin' && (
                        <>
                            <button onClick={() => navigate('/admin')}>Admin Page</button>
                        </>
                    )}
                    {user?.role === 'user' && (
                        <button onClick={() => navigate('/createRSO')}>Request RSO</button>
                    )}

                    <button onClick={() => navigate('/universities')}>Universities</button>
                    <button onClick={() => navigate('/rso-list')}>RSO List</button>
                    <button onClick={() => navigate('/home')}>Events</button>
                    <button onClick={() => logout()}>Logout</button>
                </nav>
            </header>
        )}
        </>
    );
}

export default Header;
