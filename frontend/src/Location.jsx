import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Location.css'; 
import { useAuth } from './AuthContext'; 

const Location = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        longitude: '',
        latitude: ''
    });

    useEffect(() => {
        
        const map = L.map('map').setView([28.6024, -81.2001], 15); // Default view

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        let marker;

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;

            setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng
            }));

            if (marker) map.removeLayer(marker);

            marker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
        });
        

    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, description, longitude, latitude } = formData;

        if (!name || !description || !longitude || !latitude) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch('/api/create-location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, longitude, latitude })
            });

            if (response.ok) {
                alert("Location created successfully.");
                setFormData({
                    name: '',
                    description: '',
                    longitude: '',
                    latitude: '',
                    universityID: user.universityID
                });
            } else {
                alert("Failed to create location.");
            }
        } catch (error) {
            console.error("Error creating location:", error);
        }
    };

    return (
        <div className="location-form">
            <h2>Create a Location</h2>
            <div id="map" style={{ width: "100%", height: "400px", marginBottom: "20px" }}></div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Location Name" 
                    value={formData.name} 
                    onChange={handleChange} 
                />
                <textarea 
                    name="description" 
                    placeholder="Description" 
                    value={formData.description} 
                    onChange={handleChange} 
                />
                <input 
                    type="text" 
                    name="longitude" 
                    placeholder="Longitude" 
                    value={formData.longitude} 
                    onChange={handleChange} 
                    readOnly 
                />
                <input 
                    type="text" 
                    name="latitude" 
                    placeholder="Latitude" 
                    value={formData.latitude} 
                    onChange={handleChange} 
                    readOnly 
                />
                <button type="submit">Create Location</button>
            </form>
        </div>
    );
};

export default Location;
