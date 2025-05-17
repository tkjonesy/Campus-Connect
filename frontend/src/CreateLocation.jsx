import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CreateLocation.css';
import { useNavigate } from 'react-router-dom';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});


function CreateLocation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapref = useRef;

  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locations, setLocations] = useState([]);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mapContainer = L.DomUtil.get('event-map');
      if (mapContainer && mapContainer._leaflet_id) {
        mapContainer._leaflet_id = null; // fix: prevent double initialization
      }
    }

    const map = L.map('event-map', {
      center: [51.505, -0.09],
      zoom: 13
    });


    if (locations && locations.length > 0) {
        const firstLoc = locations[0];
        map.setView([firstLoc.Latitude, firstLoc.Longitude], 15);
    } else {
        // fallback if something went wrong
        map.setView([28.6024, -81.2001], 15);
    }
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
      
        let marker = null;
      
        map.on('click', function (e) {
          const { lat, lng } = e.latlng;
          setLat(lat);
          setLng(lng);
      
          console.log("Clicked at:", lat, lng); 

          if (marker) {
            marker.setLatLng(e.latlng);
          } else {
            marker = L.marker(e.latlng).addTo(map);
          }
        });
      
        return () => map.remove();
    }, []);
      


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!locationName || !lat || !lng) {
      alert('Please fill out all fields and click a point on the map.');
      return;
    }
  
    const payload = {
      name: locationName,
      description: description || "N/A",
      latitude: lat,
      longitude: lng,
      universityID: user.uniID
    };
  
    console.log("Payload being sent:", payload);
  
    try {
      const response = await fetch('/api/create-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  3
      const data = await response.json();
  
      if (data.message === "Location already exists") {
        alert("⚠️ This location already exists.");
      } else {
        alert(" Location saved successfully!");
      }
  
      
      navigate('/admin');
  
    } catch (err) {
      console.error("Error:", err);
      alert(" Failed to save location.");
    }
  };
  

  if (!user || user.role !== 'admin') {
    return <p>Access denied. You must be an admin to create locations.</p>;
  }

  return (
    <div className="create-location-container">
      <h2>Create New Location</h2>
      <p>Click anywhere on the map to set the location's coordinates.</p>
      <div
  id="create-map"
  style={{ height: '400px', width: '100%', marginBottom: '20px', border: '2px solid #ccc' }}
></div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Location Name:</label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description (optional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <p>📍 Selected Coordinates:</p>
          <p>Latitude: {lat || '--'}, Longitude: {lng || '--'}</p>
        </div>
        <button type="submit">Save Location</button>
      </form>
    </div>
  );
}

export default CreateLocation;
