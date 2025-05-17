import React, { useState, useEffect } from 'react';
import './PromoteUser.css'

function PromoteUser() {
    const [promoteUserData, setPromoteUserData] = useState({
        Username: '',
        UID: null
    });

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showDropDown, setShowDropDown] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchPromotableUsers = () => {
        fetch('/api/basic-users')
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error('Error fetching users:', error));
    };

    // Fetch list of promotable users when rendered
    useEffect(() => {
        fetchPromotableUsers();
    }, 
    []);

    // Update selection when user clicks from dropdown
    const handleSelectionPromotionUser = (user) => {
        setPromoteUserData({ ...promoteUserData, Username: user.Username, UID: user.UID });
        setShowDropDown(false);
    };

    const handleChange = (e) => {
        setPromoteUserData({ ...promoteUserData, [e.target.name]: e.target.value });

        // Update users list based on search
        if (e.target.name === 'Username') {
            const searchTerm = e.target.value;

            setError('');
            setSuccess('');

            // Check if the input was changed to empty
            if (searchTerm === '') {
                setFilteredUsers([]);
                setShowDropDown(false);
            }

            // filter the fetched user list based on the searchTerm
            else {
                const filtered = users.filter(user =>
                    user.Username.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredUsers(filtered);
                setShowDropDown(filtered.length > 0);
            }
        }
    };

    // Promote selected user
    const handlePromotion = async (e) => {
        e.preventDefault();

        // Check that a valid user is selected
        if (!promoteUserData.UID) {
            setError('A valid user must be selected');
            return;
        }

        // Send API call to backend to promote user
        try {
            const response = await fetch('/api/promote-user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(promoteUserData)

            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            // User was successfully promoted
            setError('');
            setSuccess('User was successfully promoted!');
            setPromoteUserData({ Username: '', UID: null });
            setFilteredUsers([]);
            fetchPromotableUsers();
        }

        catch (error) {
            console.error('User Promotion Error:', error);
            setError('User Promotion Error');
        }
    };

    return (
        <div className="make-user-admin-container">
            <h2>Promote User to Admin</h2>
            {/* Show any errors or successes*/}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handlePromotion}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input 
                    type="text" 
                    id="user" 
                    name="Username" 
                    placeholder="Search for a user..." 
                    required
                    value={promoteUserData.Username}
                    onChange={handleChange} 
                    onFocus={() => setShowDropDown(filteredUsers.length > 0)}
                    />                       
                    {showDropDown && (
                        <ul className="dropdown">
                            {filteredUsers.map((user) => (
                                <li key={user.UID} onClick={() => handleSelectionPromotionUser(user)}>
                                    {user.Username}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit">Make Admin</button>
            </form>
        </div>
    );
}

export default PromoteUser;