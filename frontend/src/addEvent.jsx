import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './addEvent.css'; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';


function AddEvent({ rsoID = null }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedLocationName, setSelectedLocationName] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('General');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [eventType, setEventType] = useState('public');
    const [locID, setLocID] = useState(1);
    const [showMap, setShowMap] = useState(false);
    const [locations, setLocations] = useState([]);
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            const existingMap = L.DomUtil.get('event-map');
            if (existingMap !== null) {
                existingMap._leaflet_id = null;
            }
        }
    }, []);
    
    useEffect(() => {
        if (showMap && user?.uniID) {
            fetch(`/api/locations/${user.uniID}`)
            .then((res) => res.json())
            .then((data) => setLocations(data))
            .catch((err) => console.error("Error loading locations:", err));
        }
      }, [showMap, user]);
      
    useEffect(() => {
        if (!showMap || locations.length === 0) return;
    
        setTimeout(() => {
            const existingMap = L.DomUtil.get('event-map');
            if (existingMap) {
                existingMap._leaflet_id = null; // Reset old map
            }
    
            let centerCoords = [28.6024, -81.2001]; // Default to UCF

            if (user?.uniID === 2) {
            centerCoords = [29.6489, -82.3456]; // UF Reitz Union as default center
            }
            const customIcon = L.icon({
                iconUrl: '/red-pin.png',
                iconSize: [30, 40],
                iconAnchor: [15, 40],
                popupAnchor: [0, -40],
              });

            const map = L.map('event-map', {
                center: centerCoords,
                zoom: 15,
                scrollWheelZoom: true,
                dragging: true,
                zoomControl: true,
                doubleClickZoom: true,
              });
              
            let tempMarker = null;

            map.on('click', function (e) {
                const { lat, lng } = e.latlng;
                alert(`You clicked at:\nLatitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`);

                if (tempMarker) {
                    tempMarker.setLatLng(e.latlng);
                } else {
                    tempMarker = L.marker(e.latlng).addTo(map);
                }
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);
    
            const bounds = [];
            
            locations.forEach((loc) => {
                if (loc.Latitude && loc.Longitude) {
                    const marker = L.marker([loc.Latitude, loc.Longitude],{ icon: customIcon })
                        .addTo(map)
                        .bindPopup(`<strong>${loc.Name}</strong><br>${loc.Description}`)
                        .on('click', () => {
                            setLocID(loc.LocID);
                            setSelectedLocationName(loc.Name);
                            alert(`Selected location: ${loc.Name}`);
                        });
    
                    bounds.push([loc.Latitude, loc.Longitude]);
                }
            });
    
            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }, 0); // run after render
    }, [showMap, locations]);
      
      

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.uniID) {
            console.error("User or university ID not found.");
            return;
        }

        const payload = {
            name,
            category,
            description: description || "No description provided",
            eventDate,
            eventTime,
            contactEmail,
            contactPhone,
            eventType,
            locID,
            universityID: user.uniID,
            rsoID: rsoID || null
        };

      
        
        console.log("Sending Payload:", payload);
        

            


        try {
            if (!locID) {
                alert("Please select a location from the map before submitting.");
                return;
              }
            const response = await fetch('/api/create-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server Error: ", errorData);
                return;
            }

            const result = await response.json();
            console.log("Event created successfully:", result);
            navigate('/home');
        } catch (error) {
            console.error("Request Error: ", error);
        }
    };

    
    
    return (
        <div className="event-register-container">
            <h1>Add Event</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Event Name</label>
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Event Name"
                    />
                </div>

                <div className="input-group">
                    <label>Description</label>
                    <input 
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Event Description"
                    />
                </div>
                <div className="input-group">
                    <label>Category</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="General">General</option>
                        <option value="Social">Social</option>
                        <option value="Academic">Academic</option>
                        <option value="Volunteer">Volunteer</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Event Date</label>
                    <input 
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Event Time</label>
                    <input 
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Contact Email</label>
                    <input 
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Contact Email"
                    />
                </div>

                <div className="input-group">
                    <label>Contact Phone</label>
                    <input 
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Contact Phone"
                    />
                </div>

                <div className="radio-options">
                    <label>
                        <input 
                            type="radio" 
                            value="Public" 
                            checked={eventType === 'Public'}
                            onChange={() => setEventType('Public')}
                        />
                        Public
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            value="Private" 
                            checked={eventType === 'Private'}
                            onChange={() => setEventType('Private')}
                        />
                        Private
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            value="RSO" 
                            checked={eventType === 'RSO'}
                            onChange={() => setEventType('RSO')}
                        />
                        RSO
                    </label>
                </div>
                <div className="input-group">
                    <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        style={{ marginBottom: "10px" }}
                    >
                        {showMap ? "🗺️ Hide Campus Map" : "🗺️ View Campus Map"}
                    </button>

                    {showMap && (
                        <div>
                            <p>Select a location by clicking a marker:</p>
                            <div
                                id="event-map"
                                style={{
                                height: "400px",
                                width: "100%",
                                marginBottom: "20px",
                                borderRadius: "8px",
                                border: "2px solid #ccc",
                                zIndex: 0, 
                                position: "relative" 
                                }}  ></div>
                        </div>
                    )}
                </div>
                {selectedLocationName && (
                <p style={{ fontWeight: "bold" }}>📍 Selected Location: {selectedLocationName}</p>
                )}
                
                               
            <button type="submit">Create Event</button>
            </form>
        </div>
    );
}
export default AddEvent;
