import React, { useState } from 'react';
import './CreateUniversity.css';

function CreateUniversity () {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uniData, setUniData] = useState({
        uniName: '',
        address: '',
        desc: '',
        numStudents: null,
        pics: ''
    });

    // Handle changes in form
    const handleChange = async (e) => {
        setUniData({ ...uniData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    // Handle form submisison
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Send API request
        try {
            const response = await fetch('/api/create-university', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uniData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }
        }

        catch (error) {
            console.error('University creation error:', error);
            setError('University creation failed');
        }

        // Successfull creation of university
        setError('');
        setSuccess('University created successfully!');
        setUniData({
            uniName: '',
            address: '',
            desc: '',
            numStudents: null,
            pics: ''
        });

    };

    return (
        <div className='create-uni-container'>
            <h2>Create New University</h2>
            {/* Show any errors or successes*/}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="uniName">Name of University</label>
                    <input
                    type="text"
                    id="uniName"
                    name="uniName"
                    maxLength="50"
                    value={uniData.uniName}
                    required
                    onChange={handleChange}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="address">Address</label>
                    <input
                    type="text"
                    id="address"
                    name="address"
                    maxLength="50"
                    value={uniData.address}
                    required
                    onChange={handleChange}
                    />
                </div>
                <div className="input-group desc">
                    <label htmlFor="desc">Description</label>
                    <textarea
                        id="desc"
                        name="desc"
                        value={uniData.desc}
                        onChange={handleChange}
                        maxLength={1000}
                        placeholder="Enter a description..."
                        />
                </div>
                <div className="input-group">
                    <label htmlFor="numStudents">Number of Students</label>
                    <input
                    type="number"
                    id="numStudents"
                    name="numStudents"
                    value={uniData.numStudents || ''}
                    required
                    onChange={handleChange}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="pics">Pictures</label>
                    <input
                    type="text"
                    id="pics"
                    name="pics"
                    value={uniData.pics}
                    required
                    onChange={handleChange}
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

export default CreateUniversity;