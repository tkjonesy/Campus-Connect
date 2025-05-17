import React, { useState, useEffect } from 'react';
import './RSORequests.css';

function RSORequests() {
    const [requests, setRequests] = useState([]);

    const fetchPendingRSO = () => {
        fetch('/api/pending-rso-requests')
            .then((response) => response.json())
            .then((data) => setRequests(data))
            .catch((error) => console.error('Error fetching requests:', error));
    };

    // Fetch list of pending RSOs
        useEffect(() => {
            fetchPendingRSO();
        }, 
        []);

    // RSO approved by admin
    const handleApprove = async (id) => {

        try {
            const response = await fetch(`/api/rso-request/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Status: 1 })
            });

            if (response.ok) {
                fetchPendingRSO();
            }
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    // RSO denied by admin
    const handleDeny = async (id) => {

        try {
            const response = await fetch(`/api/rso-request/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                fetchPendingRSO();
            }
        } catch (error) {
            console.error("Error declining request:", error);
        }
    };

    return (
        <div className="requests-container">
            <h2>RSO Requests</h2>
            {requests.length > 0 ? requests.map(request => (
                <div key={request.rso.id} className="request-card">
                    <h3>{request.rso.name}</h3>
                    <p><strong>University:</strong> {request.university.name}</p>
                    <p><strong>Description:</strong> {request.rso.description}</p>
                    <p><strong>Requested Admin:</strong> {request.admin.username} </p>
                    <div className="button-group">
                        <button onClick={() => handleApprove(request.rso.id)} className="accept-button">Approve</button>
                        <button onClick={() => handleDeny(request.rso.id)} className="decline-button">Deny</button>
                    </div>
                </div>
            )) : (
                <p>No pending requests at the moment.</p>
            )}
        </div>
    )
}

export default RSORequests;