import React, { useState, useEffect } from 'react';
import './frontPage.css';
import { useAuth } from './AuthContext';  // Importing the useAuth hook
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';



// Retrieve the logged-in username from localStorage
//const currentUser = localStorage.getItem('username');

function FrontPage() {
    const [events, setEvents] = useState([]);
    const [comments, setComments] = useState({});
    const [ratings, setRatings] = useState({});
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [editText, setEditText] = useState(""); 
    const [editRating, setEditRating] = useState(""); 
    const [editIndex, setEditIndex] = useState(null);
    const navigate = useNavigate('');
    const { user } = useAuth(); 





    const currentUser = user.username; // Retrieve the username from the user object

    useEffect(() => {
    
        if (!user) return; // Ensure user is authenticated
    
        // Fetching events from backend with the user's UniversityID
        fetch(`/api/events?universityID=${user.uniID}&userRole=${user.role}&userID=${user.userID}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched events:', data); 
                setEvents(data);
            })
            .catch(error => console.error('Error fetching events:', error));
    }, [navigate, user]);

    const toggleExpand = async (eventId) => {
        if (expandedEvent === eventId) {
            setExpandedEvent(null);
        } else {
            try {
                const response = await fetch(`/api/comments/${eventId}`);
                const data = await response.json();
                const updatedEvents = events.map(event => 
                    event.EventID === eventId ? { ...event, comments: data } : event
                );
                setEvents(updatedEvents);
                setExpandedEvent(eventId);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        }
    };


    const handleCommentChange = (eventId, value) => {
        setComments({ ...comments, [eventId]: value });
    };

    const handleRatingChange = (eventId, value) => {
        setRatings({ ...ratings, [eventId]: value });
    };

    const handleCommentSubmit = async (eventId) => {
        const commentText = comments[eventId];
        const rating = ratings[eventId];
        const studentId = user.userID; 
        const username = user.username;

        if (!user || !user.userID) {
            console.warn("User not authenticated or userID is null.");
            return;
        }
    
        if (!commentText || !rating) {
            alert("Please enter a comment and select a rating.");
            return;
        }
        
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    EventID: eventId,
                    StudentID: parseInt(studentId),
                    CommentText: commentText,
                    Rating: parseInt(rating)
                })
            });
            console.log("Response:", response); // Log the response for debugging
    
            if (response.ok) {
                console.log("Comment saved successfully.");
                console.log("Comment saved successfully.");
                setComments({ ...comments, [eventId]: "" });
                setRatings({ ...ratings, [eventId]: "" });

                await toggleExpand(eventId);
            } else {
                console.error("Failed to save comment.", response.statusText);
            }
        } catch (error) {
            console.error("Error saving comment:", error);
        }
    };
    
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
    
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE'
            });
    
            if (response.ok) {
                console.log("Event deleted.");
                setEvents(events.filter(event => event.EventID !== eventId)); // Remove from UI
            } else {
                console.error("Failed to delete event.");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleEditComment = (eventId, commentIndex, commentText, commentRating) => {
        setEditText(commentText);
        setEditRating(commentRating);
        setEditIndex(commentIndex);

        const updatedEvents = events.map(event => {
            if (event.EventID === eventId) {
                const updatedComments = event.comments.map((comment, index) => 
                    index === commentIndex ? { ...comment, isEditing: true } : comment
                );
                return { ...event, comments: updatedComments };
            }
            return event;
        });

        setEvents(updatedEvents);
    };

    const handleSaveComment = async (eventId, commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CommentText: editText,
                    Rating: parseInt(editRating),
                    userRole: user.role, 
                    userID: user.userID
                })
            });
    
            if (response.ok) {
                console.log("Comment updated successfully.");
                toggleExpand(eventId);  // Reload comments to reflect changes
            }
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };
    
    const handleDeleteComment = async (eventId, commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userRole: user.role,   // Send user role
                    userID: user.userID     // Send user ID
                })
            });
    
            if (response.ok) {
                console.log("Comment deleted successfully.");
                toggleExpand(eventId);  // Reload comments to reflect changes
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <div className="front-page-container">
            <h2>Upcoming Events</h2>
            <div className="event-list">
                {events.length === 0 ? (
                    <p>No events to display.</p>
                ) : (
                    events.map((event) => (
                        <div key={event.EventID} className="event-card">
                            {(user.role === 'admin') && (
                                <>
                                <button
                                    onClick={() => handleDeleteEvent(event.EventID)}
                                    className="admin-delete-btn"
                                    title="Delete Event"
                                >X
                                </button>
                                </>
                            )}
                            <h3>{event.Name}</h3>
                            <p><strong>Category:</strong> {event.Category || 'General'}</p>
                            <p><strong>Description:</strong> {event.Description || 'No description provided'}</p>
                            <p><strong>Date:</strong> {new Date(event.EventDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'UTC'
                            })}</p>
                            <p><strong>Time:</strong> {event.EventTime?.slice(11, 16) || 'Not Specified'}</p>
                            <p><strong>Type:</strong> {event.EventType}</p>
                            <p><strong>Location:</strong> {event.LocationName || 'TBA'}</p>
                            <p><strong>Email:</strong> <a href={`mailto:${event.ContactEmail}`}>{event.ContactEmail}</a></p>
                            <p><strong>Phone:</strong> <a href={`tel:${event.ContactPhone}`}>{event.ContactPhone}</a></p>

                            <button className="expand-button" onClick={() => toggleExpand(event.EventID)}>
                                {expandedEvent === event.EventID ? 'Hide Comments' : 'Show Comments'}
                            </button>

                            {expandedEvent === event.EventID && (
                                <div className="comment-section-content">
                                    <h4>Comments</h4>
                                    {event.comments?.length > 0 ? (
                                        event.comments.map((comment, index) => (
                                            <div key={index} className="comment">
                                                {comment.isEditing ? (
                                                    <>
                                                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                                                        <select value={editRating} onChange={(e) => setEditRating(e.target.value)}>
                                                            <option value="">Select Rating</option>
                                                            <option value="1">1 - Poor</option>
                                                            <option value="2">2 - Fair</option>
                                                            <option value="3">3 - Good</option>
                                                            <option value="4">4 - Very Good</option>
                                                            <option value="5">5 - Excellent</option>
                                                        </select>
                                                        <button onClick={() => handleSaveComment(event.EventID, comment.CommentID)}>Save</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>{comment.Username || "Anonymous"}</strong> (Rating: {comment.Rating}/5)</p>
                                                        <p>{comment.CommentText}</p>
                                                        {(comment.Username === currentUser || user.role === 'admin') && (
                                                            <>
                                                                <button onClick={() => handleEditComment(event.EventID, index, comment.CommentText, comment.Rating)}>Edit</button>
                                                                <button onClick={() => handleDeleteComment(event.EventID, comment.CommentID)}>Delete</button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No comments available yet.</p>
                                    )}
       
                                    <h4>Leave a Comment</h4>
                                    <select value={ratings[event.EventID] || ""} onChange={(e) => handleRatingChange(event.EventID, e.target.value)}>
                                        <option value="">Select Rating</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="3">3 - Good</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                    <textarea
                                        placeholder="Leave a comment..."
                                        value={comments[event.EventID] || ""}
                                        onChange={(e) => handleCommentChange(event.EventID, e.target.value)}
                                    />
                                    <button onClick={() => handleCommentSubmit(event.EventID)}>Submit Comment</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>  
    );
                                        }
export default FrontPage;
