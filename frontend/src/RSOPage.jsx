import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './RSOPage.css';
import AddEvent from './addEvent';

function RSOPage() {
    const { user } = useAuth();
    const { rsoID } = useParams();
    const [ RSO, setRSO ] = useState({});
    const [ university, setUniverstiy ] = useState({});
    const [ rsoAdmin, setRSOAdmin ] = useState({});
    const [ rsoMembers, setRSOMembers ] = useState([]);
    const navigate = useNavigate();


    // Function to fetch RSO data
    const fetchRSOData = () => {
        fetch(`/api/rso/${rsoID}`)
            .then((res) => res.json())
            .then((data) => {
                setRSO(data.rso);
                setUniverstiy(data.university);
                setRSOAdmin(data.admin);
                setRSOMembers(data.members);
            })
            .catch((error) => {
                console.error('Error fetching RSO:', error);
                navigate('/home');
            });
    };

    // Run fetch after component loads
    useEffect(() => {
        console.log(`Current Logged in User: ${user.username}`);
        fetchRSOData();
    }, [rsoID]);


    // Add current user to RSO
    const handleJoinRSO = async () => {

        try {
            const response = await fetch('/api/add-user-rso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID: user.userID,
                    rsoID: RSO.id
                })
            });

            if (response.ok) {
                // Check if the RSO has fewer than 5 members after then join
                if (rsoMembers.length < 4) {
                    navigate('/home');
                }
                fetchRSOData();
            }
        } catch (error) {
            console.error("Error adding user to RSO:", error);
        }
    };

    // Remove current user from RSO
    const handleLeaveRSO = async () => {

        try {
            const response = await fetch('/api/delete-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID: user.userID,
                    rsoID: RSO.id
                })
            });

            if (response.ok) {
                // Check if the RSO has fewer than 5 members after the leave
                if (rsoMembers.length <= 5) {
                    navigate('/home');
                }
                fetchRSOData();
            }
        } catch (error) {
            console.error("Error removing user from RSO:", error);
        }
    };

    return (
        <div className="rso-page">
            <div className= "title-info">
                <h1>{RSO.name}</h1>
                <p><strong>Description:</strong> {RSO.description}</p>
            </div>

            <div className="university-info">
                <h3>University Information</h3>
                <p><strong>University Name:</strong> {university.name}</p>
            </div>

            <div className="admin-info">
                <h3>Admin Information</h3>
                <p><strong>Admin Username:</strong> {rsoAdmin.username}</p>
                <p><strong>Admin Email:</strong> {rsoAdmin.email}</p>
            </div>

            <div className="members-info">
                <h3>RSO Members</h3>
                {university.uid === user.uniID && user.userID !== rsoAdmin.uid ? (
                <div className="membership-controls">
                    {rsoMembers.some(member => member.uid === user.userID) ? (
                        <button className="leave" onClick={handleLeaveRSO}>
                            Leave RSO
                        </button>
                    ) : (
                        <button className="join" onClick={handleJoinRSO}>
                            Join RSO
                        </button>
                    )}
                </div>
                ) : null}
                {rsoMembers.length > 0 ? (
                    <ul>
                        {rsoMembers.map((member) => (
                            <li key={member.uid}>
                                <strong>{member.username}</strong> (Joined: {new Date(member.joinDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'UTC'
                                })})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>This RSO has no Members</p>
                )}
            </div>
            {user.username === rsoAdmin.username && (
                <div className="add-event-form">
                    <AddEvent rsoID={rsoID} />
                </div>
            )}
        </div>
    );
}

export default RSOPage;