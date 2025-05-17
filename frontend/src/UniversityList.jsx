import React, { useEffect, useState } from "react";
import './UniversityList.css';


const UniversityList = () => {
    const [universities, setUniversities] = useState([]);
    
    useEffect(() => {
        fetch("/api/universities")
            .then((response) => response.json())
            .then((data) => setUniversities(data))
            .catch((error) => console.error("Error fetching universities:", error));
    }, []);

    return (
        <div>
            <div className="university-list-card">
                <h2 className="title">Universities</h2>
                <ul className="university-list">
                    {universities.map((uni) => (
                        <li key={uni.UniversityID} className="university-item">
                            <div className="university-info">
                                <strong>{uni.Name}</strong> - {uni.Location}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UniversityList;