import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function MyRSOsDropdown() {
    const { isAuthenicated, user } = useAuth();
    const navigate = useNavigate();
    const [userRSOs, setUserRSOs] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchUserRSOs = async () => {
            if (!user?.userID) return;
    
            console.log("Fetching RSOs for user:", user.username);
            try {
                const response = await fetch(`/api/user-rsos/${user.userID}`);
                const data = await response.json();
                setUserRSOs(data);
            } catch (error) {
                console.error("Failed to fetch RSOs:", error);
            }
        };
    
        fetchUserRSOs();
    }, [isAuthenicated, user]);    

    if (!user) return null;

    return (
        <div className="rso-dropdown">
            <button onClick={() => setShowDropdown(!showDropdown)}>My RSOs</button>
            {showDropdown && (
                <ul className="rso-list">
                    {userRSOs.length === 0 ? (
                        <li className="rso-empty">You’re not a member of any RSOs yet.</li>
                    ) : (
                        userRSOs.map((rso) => (
                            <li key={rso.RSO_ID} onClick={() => {
                                setShowDropdown(false);
                                navigate(`/rso/${rso.RSO_ID}`);}}>
                                {rso.Name}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

export default MyRSOsDropdown;
