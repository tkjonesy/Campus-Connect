import React, { useEffect, useState } from 'react';
import './RSOrequest.css';
import logo from './assets/campusconnect.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';  // Importing the useAuth hook

function RSORequest() {

    const [emails, setEmails] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [showEmailDropDown1, setShowEmailDropDown1] = useState(false);
    const [showEmailDropDown2, setShowEmailDropDown2] = useState(false);
    const [showEmailDropDown3, setShowEmailDropDown3] = useState(false);
    const [showEmailDropDown4, setShowEmailDropDown4] = useState(false);
    const [error, setError] = useState("");
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        rsoName: '',
        desc: '',
        Email1: '',
        Email2: '',
        Email3: '',
        Email4: '',
    });

    useEffect(() => {
        console.log(`logged in User ID: ${user.username}`);
        console.log(`logged in User ID: ${user.userID}`);
        fetch("/api/emails")
            .then((response) => response.json())
            .then((data) => setEmails(data))
            .catch((error) => console.error("Error fetching emails:", error));
    }, 
    []);

    const handleSelectionEmail = (email, key) => {
        const updatedFormData = { ...formData };
        updatedFormData[`Email${key}`] = email.Email;
        setFormData(updatedFormData);

        if (key === 1) setShowEmailDropDown1(false);
        if (key === 2) setShowEmailDropDown2(false);
        if (key === 3) setShowEmailDropDown3(false);
        if (key === 4) setShowEmailDropDown4(false);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
    
        // Update the formData state correctly
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));

        if (name.startsWith("Email")) {
            const filtered = emails.filter(email => 
                email.Email.toLowerCase().includes(value.toLowerCase())
            );

            if (name === "Email1") {
                setFilteredEmails(filtered);
                setShowEmailDropDown1(filtered.length > 0);
            }
            else if (name === "Email2") {
                setFilteredEmails(filtered);
                setShowEmailDropDown2(filtered.length > 0);
            }
            else if (name === "Email3") {
                setFilteredEmails(filtered);
                setShowEmailDropDown3(filtered.length > 0);
            }
            else if (name === "Email4") {
                setFilteredEmails(filtered);
                setShowEmailDropDown4(filtered.length > 0);
            }
        }

    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailToUID = async (email) => {
            const res = await fetch(`/api/lookup-uid-by-email/${encodeURIComponent(email)}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch UID for ${email}`);
            }
            const data = await res.json();
            return data.UID;
        };

        const UID1 = await emailToUID(formData.Email1);
        const UID2 = await emailToUID(formData.Email2);
        const UID3 = await emailToUID(formData.Email3);
        const UID4 = await emailToUID(formData.Email4);
        

        const payload = {
            rsoName: formData.rsoName,
            desc: formData.desc,
            adminID: user.userID,
            universityID: user.uniID,
            UID1,
            UID2,
            UID3,
            UID4
        };

        console.log(`Here is the load from the front end: ${JSON.stringify(payload)}`);

     
        if (!isAuthenticated) {
            alert("You must be logged in to submit an RSO request.");
            return;
        }    

        // Check if all three emails are unique
        const emailSet = new Set([formData.Email1, formData.Email2, formData.Email3, formData.Email4]);
        if (emailSet.size !== 4) {
            setError("All emails must be different.");
            return;
        }
        console.log("Sending the following data to the server:");
        console.log("Sending the following data to the server:", payload);


        try {
           // console.log(user);  
            //console.log(`User ID: ${user?.userID}`); 
            const response = await fetch('/api/create-rso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)

        }); 

        const responseData = await response.json();
        console.log("Response data from server:", responseData);

        if (response.status === 409) {
            setError(responseData.error); 
            return;
          }

            if (response.status === 200) {
                // Success - Reset form and show success message
                console.log("RSO registered successfully!");
                setFormData({
                    rsoName: '',
                    desc: '',
                    Email1: '',
                    Email2: '',
                    Email3: '',
                    Email4: '',
                });
                console.log("RSO Request Has Been Send!");
                // Redirect user to homepage or another relevant page
                navigate('/home');
            }
            else {
                setError("Something went wrong. Please try again.");
              }
            
        } catch (error) {
            console.error("RSO registration error:", error);
            setError("Failed to register RSO.");
        }
    };

    return (
        <div className="rso-request-container">
            <div className="logo-container">
                <a href='/'>
                    <img src={logo} alt="CampusConnect Logo" className="logo" />
                </a>
                <p className="website-name">CampusConnect</p>
            </div>
            <h2>Create a request for your RSO!</h2>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="rsoName">Name of RSO</label>
                    <input type="text" id="rsoName" name="rsoName" value={formData.rsoName} maxLength="50" required onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Description</label>
                    <textarea 
                        type = "text"
                        name="desc" 
                        className="description"
                        value={formData.desc}
                        rows="6" 
                        maxLength="500" 
                        required 
                        onChange={handleChange}
                    />
                </div>
                                <div className="input-group">
                <label htmlFor="Email1">Select Email 1</label>
                <input 
                    type="text" 
                    id="Email1" 
                    name="Email1" 
                    placeholder="Search for an email..." 
                    value={formData.Email1}
                    onChange={handleChange} 
                    onFocus={() => setShowEmailDropDown1(filteredEmails.length > 0)}
                />
                {showEmailDropDown1 && (
                    <ul className="dropdown">
                        {filteredEmails.map((email, index) => (
                            <li key={index} onClick={() => handleSelectionEmail(email, 1)}>
                                {email.Email}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="input-group">
                <label htmlFor="Email2">Select Email 2</label>
                <input 
                    type="text" 
                    id="Email2" 
                    name="Email2" 
                    placeholder="Search for an email..." 
                    value={formData.Email2}
                    onChange={handleChange} 
                    onFocus={() => setShowEmailDropDown2(filteredEmails.length > 0)}
                />
                {showEmailDropDown2 && (
                    <ul className="dropdown">
                        {filteredEmails.map((email, index) => (
                            <li key={index} onClick={() => handleSelectionEmail(email, 2)}>
                                {email.Email}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="input-group">
                <label htmlFor="Email3">Select Email 3</label>
                <input 
                    type="text" 
                    id="Email3" 
                    name="Email3" 
                    placeholder="Search for an email..." 
                    value={formData.Email3}
                    onChange={handleChange} 
                    onFocus={() => setShowEmailDropDown3(filteredEmails.length > 0)}
                />
                {showEmailDropDown3 && (
                    <ul className="dropdown">
                        {filteredEmails.map((email, index) => (
                            <li key={index} onClick={() => handleSelectionEmail(email, 3)}>
                                {email.Email}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="input-group">
                <label htmlFor="Email4">Select Email 4</label>
                <input 
                    type="text" 
                    id="Email4" 
                    name="Email4" 
                    placeholder="Search for an email..." 
                    value={formData.Email4}
                    onChange={handleChange} 
                    onFocus={() => setShowEmailDropDown4(filteredEmails.length > 0)}
                />
                {showEmailDropDown4 && (
                    <ul className="dropdown">
                        {filteredEmails.map((email, index) => (
                            <li key={index} onClick={() => handleSelectionEmail(email, 4)}>
                                {email.Email}
                            </li>
                        ))}
                    </ul>
                )}
                </div>
                <button type="submit">Request RSO</button>
            </form>
        </div>
    );
}

export default RSORequest;
