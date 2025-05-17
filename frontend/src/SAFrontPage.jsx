import React, { useState, useEffect } from 'react';
import './SAFrontPage.css';
import PromoteUser from './Admin Components/PromoteUser';
import RSORequests from './Admin Components/RSORequests';
import CreateUniversity from './Admin Components/CreateUniversity';

import { useNavigate } from 'react-router-dom';


function SAFrontPage() {
    const navigate = useNavigate();

    return (
        <div className="super-admin-page">
            {/* 🔘 Add button at the top */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => navigate('/create-location')}>
                    🗺️ Create New Location
                </button>
            </div>

            <RSORequests />
            <PromoteUser />
            <CreateUniversity />
        </div>
    );
}

export default SAFrontPage;