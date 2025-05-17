const express = require('express');
const cors = require ('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const dbFunctions = require('./dbFiles/dbFunctions');
const University = require('./dbFiles/University');
const Student = require('./dbFiles/Student');
const RSO = require('./dbFiles/RSO');

const API_PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));

app.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Backend may already be running.`);
    process.exit(1);
  } else {
    throw err;
  }
});

// API endpoint for logging in
app.post('/api/login', async (req, res)=> {

    try {
        const user = await dbFunctions.getUser(req.body.username);
        
        // No user is found in database
        if (!user) {
            return res.status(401).json({ error: 'Invalid Username' });
        }

        // Compare returned user from request to database
        const isMatch = await bcrypt.compare(req.body.password, user.PasswordHash);

        // Passwords do not match
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid Password' });
        }

        // User is authenticated, create jwt token
        const token = await generateToken(user);

        return res.json({token});

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to login' });
    }
});


// API endpoint for registering new simple user
app.post('/api/register', async (req, res)=> {

    const hashedPassword = await hashPassword(req.body.password);
    
    const newStudent = new Student(
        req.body.username,
        hashedPassword,
        req.body.fname,
        req.body.lname,
        req.body.email,
        req.body.uniID,
        req.body.role
    );

    try {
        if (await dbFunctions.getUser(newStudent.Username)) {
            return res.status(401).json({ error: 'Username Already in Use' });
        }

        if (await dbFunctions.getUserEmail(newStudent.Email)) {
            return res.status(401).json({ error: 'Email Already in Use' });
        }

        await dbFunctions.createStudent(newStudent);
        const user = await dbFunctions.getUser(newStudent.Username);

        if (user) {
            const token = await generateToken(user);
            return res.json({token});
        }

        else {
            return res.status(401).json({ error: 'Student registered but failed to return user' });
        }
        

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to Register' });
    }
});

// API endpoint for creating new university
app.post('/api/create-university', async (req, res)=> {
    
    const newUni = new University(
        req.body.uniName,
        req.body.address,
        req.body.desc,
        req.body.numStudents,
        req.body.pics,
    );

    try {
        const result = await dbFunctions.createUniversity(newUni);

        if (result) {
            res.status(201).json({ message: 'University Created Successfully!'})
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});


// API edpoint for fetching universities
app.get('/api/universities', async (req, res) => {
    try {
        const universities = await dbFunctions.getUniversities();
        res.json(universities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
});

// API endpoint for fetching events
app.get('/api/events', async (req, res) => {
    try {
        const universityID = req.query.universityID; // Get universityID from query params
        const userRole = req.query.userRole; // Get user's role from query params
        const userID = parseInt(req.query.userID);

        
        if (!universityID) {
            return res.status(400).json({ error: 'UniversityID is required.' });
        }

        if (userRole === 'admin') {
            events = await dbFunctions.getAllEvents(); // Fetch all events for admins
        } else {
            events = await dbFunctions.getEventsWithAccessFilter(parseInt(universityID), userID); // Filtered for users
        }
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events.' });
    }
});



// API endpoint for creating new event
app.post('/api/create-event', async (req, res) => {
    console.log('Request Body Received:', JSON.stringify(req.body, null, 2));

    const { name, category, description, eventDate, eventTime, contactPhone, contactEmail, eventType, rsoID, universityID, locID } = req.body;

    if (!name || !eventDate || !eventTime || !contactPhone || !eventType || !universityID || !locID) {
        console.error('Missing required fields:', req.body);
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    
    const conflict = await dbFunctions.checkEventConflict(eventDate, eventTime, locID);
    if (conflict) {
        return res.status(409).json({ error: 'An event already exists at this location, date, and time.' });
    }


    try {
        const result = await dbFunctions.createEvent({
            name,
            category,
            description,
            eventDate,
            eventTime,
            contactPhone,
            contactEmail,
            eventType,
            rsoID,
            locID,
            universityID 
        });
        
        res.status(200).json({ message: 'Event created successfully', result });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: 'Failed to create event.' });
    }
});

// API endpoint to delete an event
app.delete('/api/events/:eventId', async (req, res) => {
    const eventId = req.params.eventId;

    try {
        await dbFunctions.deleteEvent(eventId);
        res.status(200).json({ message: "Event deleted successfully." });
    } catch (error) {
        console.error("Failed to delete event:", error);
        res.status(500).json({ error: "Failed to delete event." });
    }
});

// API edpoint for fetching users
app.get('/api/users', async (req, res) => {
    try {
        const users = await dbFunctions.getallUser();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// API endpoint for promoting a user
app.put('/api/promote-user', async (req, res) => {
    try {
        const response = await dbFunctions.promoteUser(req.body.UID);
        if (response) {
            res.status(200).json({ message: 'Promoted user!' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to promote user' });
    }
});

// API edpoint for fetching promotable users
app.get('/api/basic-users', async (req, res) => {
    try {
        const users = await dbFunctions.getAllBasicUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// API edpoint for fetching user emails
app.get('/api/emails', async (req, res) => {
    try {
        const email = await dbFunctions.getAllEmails();
        res.json(email);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Emails' });
    }
});

// API edpoint for fetching users
app.get('/api/verify-token', async (req, res) => {
    try {
        const token = req.query.token;
        const user = await validateToken(token);

        if (user) {
            return res.json({'isAuthenticated': true, user});
        }

        else {
            return res.status(401).json({ 'isAuthenticated': false, user });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to validate token' });
    }
});

app.post('/api/comments', async (req, res) => {
    const { EventID, StudentID, CommentText, Rating } = req.body;

    // Check if all required fields are provided
    if (!EventID || !StudentID || !CommentText || !Rating) {
        console.error('Missing required fields:', { EventID, StudentID, CommentText, Rating });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        console.log("Incoming Comment Data:", req.body);

        await dbFunctions.saveComment(EventID, StudentID, CommentText, Rating);

        console.log("Comment saved successfully.");
        res.status(200).json({ message: "Comment saved successfully." });
    } catch (error) {
        console.error("Error saving comment:", error.message); // Log the specific error message
        console.error("Full error object:", error); // Log the entire error object for more details
        res.status(500).json({ error: "Failed to save comment. See server logs for details." });
    }
});

// API Endpoint for creating new RSO
app.post('/api/create-rso', async (req, res) => {
    try {
        const newRSO = new RSO(
            req.body.rsoName,
            req.body.desc,
            req.body.adminID,
            req.body.universityID,
            0
        );

        console.log(newRSO);

        const UID1 = req.body.UID1;
        const UID2 = req.body.UID2;
        const UID3 = req.body.UID3;
        const UID4 = req.body.UID4;

        await dbFunctions.createRSO(newRSO);

        const result = await dbFunctions.getRSOByName(newRSO.Name);

        const rsoID = result.RSO_ID;

        // Create an array of user IDs to add
        const userIDs = [
            newRSO.AdminID,
            UID1,
            UID2,
            UID3,
            UID4
        ];

        // Insert all the users in one query
        await dbFunctions.addUsersToRSO(userIDs, rsoID);

        res.status(200).json({ message: "RSO created and members added successfully." });
    } catch (err) {
        if (err.originalError?.info?.number === 2601 || err.originalError?.info?.number === 2627) {
            return res.status(409).json({ error: "An RSO with this name already exists at this university." });
        }
        console.error("Error creating RSO:", err);
        res.status(500).json({ error: "Internal server error while creating RSO." });
    }
});


// API endpoint for fetching pending RSO requests
app.get('/api/pending-rso-requests', async (req, res) => {
    try {
        const requests = await dbFunctions.getPendingRSORequests();
        res.status(201).json(requests);
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint for fetching all RSOs
app.get('/api/all-rso', async (req, res) => {
    try {
        const RSOs = await dbFunctions.getRSOs();
        res.status(201).json(RSOs);
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint for fetching RSOs by ID
app.get('/api/rso/:rsoID', async (req, res) => {
    try {
        const { rsoID } = req.params;
        const rso = await dbFunctions.getRSOByID(rsoID);
        res.json(rso);
    }

    catch(error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
    
});

// API endpoint for PATCH requests to RSOs
app.patch('/api/rso-request/:id', async (req, res) => {
    const id = req.params.id;
    const changes = req.body;

    try {
        result = await dbFunctions.updateRSO(id, changes);
        res.status(201).json({ message: 'RSO updated successfully'});
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message});
    }
});

// API endpoint for deleting RSOs
app.delete('/api/rso-request/:id', async (req, res) => {
    const id = req.params.id;

    try {
        result = await dbFunctions.deleteRSO(id);
        res.status(201).json({ message: 'RSO deleted successfully'});
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message});
    }
});

// API endpoint for fetching RSOs by user ID
app.get('/api/user-rsos/:userID', async (req, res) => {
    const userID = req.params.userID;
    try {
        const rsos = await dbFunctions.getUserRSOs(userID);
        console.log("RSOs for user:", rsos);
        res.json(rsos);
    } catch (error) {
        console.error('Error fetching user RSOs:', error);
        res.status(500).json({ error: 'Failed to fetch RSOs' });
    }
});

// API endpoint for adding a user to an RSO
app.post('/api/add-user-rso', async (req, res) => {
    try {
        const userID = req.body.userID;
        const rsoID = req.body.rsoID;
        const result = await dbFunctions.addUserRSO(userID, rsoID);
        res.status(201).json({ message: 'Successfully added user to RSO' });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: error});
    }
});

// API endpoint for removing a user from RSO
app.post('/api/delete-member', async (req, res) => {
    try {
        const userID = req.body.userID;
        const rsoID = req.body.rsoID;
        const result = await dbFunctions.removeUserRSO(userID, rsoID);
        res.status(201).json({ message: 'Successfully removed user from RSO' });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: error});
    }
});

// Fetch comments for an event
app.get('/api/comments/:eventId', async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const comments = await dbFunctions.getCommentsForEvent(eventId);
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch comments." });
    }
});

// Edit a comment
app.put('/api/comments/:commentId', async (req, res) => {
    const commentId = req.params.commentId;
    const { CommentText, Rating, userRole, userID } = req.body;

    try {

        const existingComment = await dbFunctions.getCommentById(commentId);

        if (existingComment.StudentID === userID || userRole === 'admin') {
            await dbFunctions.editComment(commentId, CommentText, Rating);
            res.status(200).json({ message: "Comment updated successfully." });
        } else {
            res.status(403).json({ error: "You are not authorized to edit this comment." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update comment." });
    }
});

// Delete a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    const commentId = req.params.commentId;
    const { userRole, userID } = req.body;
    
    try {

    const existingComment = await dbFunctions.getCommentById(commentId);


    if (existingComment.StudentID === userID || userRole === 'admin') {
        await dbFunctions.deleteComment(commentId);
        res.status(200).json({ message: "Comment deleted successfully." });
    } else {
        res.status(403).json({ error: "You are not authorized to delete this comment." });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete comment." });
    }
});

app.get('/api/locations', async (req, res) => {
    try {
        const locations = await dbFunctions.getLocations(); 
        res.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ error: "Failed to fetch locations." });
    }
});

app.post('/api/create-location', async (req, res) => {
    const { name, description, longitude, latitude, UniversityID } = req.body;
  
    if (!name || latitude == null || longitude == null) {
      return res.status(400).send("Missing required fields");
    }
  
    try {
      const result = await dbFunctions.saveLocation(name, description, longitude, latitude, UniversityID);
  
      if (result.duplicate) {
        return res.status(200).json({ message: "Location already exists" });
      }
  
      res.status(200).json({ message: "Location saved" });
  
    } catch (error) {
      console.error("Error saving location:", error);
      res.status(500).send("Server error: " + error.message);
    }
  });

// get universty by id
app.get('/api/locations/:universityID', async (req, res) => {
    try {
        const universityID = parseInt(req.params.universityID);
        const result = await dbFunctions.getUniversityByID(universityID);

        res.status(201).json(result);

    }
    catch (error) {
        console.error(" Error fetching university locations:", error); 
        res.status(500).json({ error: "Failed to fetch university-specific locations" });
    }
});

// get student uid from username
app.get('/api/lookup-uid/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const result = await dbFunctions.getStudentIDByUsername(username);

        if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        const UID = result.UID;
        res.status(201).json({ UID });
    } catch (error) {
        console.error('Error looking up UID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get student uid from email
app.get('/api/lookup-uid-by-email/:email', async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const result = await dbFunctions.getUIDByEmail(email);

        if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.json({ UID: result.UID });
    } catch (err) {
        console.error('Error looking up UID:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
// ********************************************** FUNCTIONS ***************************************************

// Function to hash passwords
async function hashPassword(password) {
    const saltRounds = 10; // Recommended strength
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

// Function to generate json web token
async function generateToken(user) {
    const token = jwt.sign({
        userID: user.UID,
        username: user.Username,
        uniID: user.UniversityID,
        role: user.Role

    },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
    return token;
}

// Function to validate json webtoken
async function validateToken(token) {
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            console.log(`${decoded.username}'s token has been validated successfully!`);
            return decoded;
        }
    }

    catch(err) {
        return null;
    }
}