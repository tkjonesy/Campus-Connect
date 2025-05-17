import React, { useEffect, useState } from "react";
import './RSOList.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const RSOList = () => {
    const [rsos, setRsos] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/all-rso")
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched RSOs:", data);
                setRsos(data);
            })
            .catch((error) => console.error("Error fetching RSOs:", error));
    }, []);

    return (
        <div className="rso-list-container">
            <h1>Registered Student Organizations</h1>
            <div className="rso-grid">
                {rsos.map((rso, index) => 
                    (rso.UniversityID === user.uniID && rso.Status) ? (
                        <div onClick={() => navigate(`/rso/${rso.RSO_ID}`)} className="rso-card" key={index}>
                            <h2>{rso.Name}</h2>
                            <p><strong>Description:</strong> {rso.Description}</p>
                            <p><strong>Admin ID:</strong> {rso.AdminID}</p>
                            <p><strong>University ID:</strong> {rso.UniversityID}</p>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
    
};

export default RSOList;