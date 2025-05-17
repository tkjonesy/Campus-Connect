const config = require('./dbConfig');
const sql = require('mssql');

//Function to save location
const saveLocation = async (name, description, longitude, latitude, UniversityID) => {
    try {
      const pool = await sql.connect(config);
  
      // 🔍 Check if this location already exists (by name and coordinates)
      const check = await pool.request()
        .input("Name", sql.VarChar(255), name)
        .input("Longitude", sql.Float, longitude)
        .input("Latitude", sql.Float, latitude)
        .input("UniversityID", sql.Int, UniversityID)
        .query(`
          SELECT * FROM Locations
          WHERE Name = @Name AND Longitude = @Longitude AND Latitude = @Latitude
        `);
  
      if (check.recordset.length > 0) {
        console.log("Duplicate location detected.");
        return { duplicate: true }; 
      }
  
      
      const result = await pool.request()
        .input("Name", sql.VarChar(255), name)
        .input("Description", sql.Text, description)
        .input("Longitude", sql.Float, longitude)
        .input("Latitude", sql.Float, latitude)
        .input("UniversityID", sql.Int, UniversityID)
        .query(`
                INSERT INTO Locations (Name, Description, Longitude, Latitude, UniversityID)
                VALUES (@Name, @Description, @Longitude, @Latitude, @UniversityID)
                `);

  
      return { duplicate: false, result };
  
    } catch (error) {
      console.error("DB Error in saveLocation:", error);
      throw error;
    }
  };
  
const getLocations = async () => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Locations');
        return result.recordset;
    } catch (error) {
        console.error("DB Error in getLocations:", error);
        throw error;
    }
};
    

// Function to fetch user based on username
const getUser = async (username) => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`SELECT * FROM Students WHERE Username = '${username}'`);
        return result.recordset[0];
    }

    catch (error) {
        console.log(error);
    }
};

// Function to add a new student to the sql database
const createStudent = async (Student) => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request()
            .query(`INSERT INTO Students VALUES
                ('${Student.Username}', '${Student.PassHash}', '${Student.FName}', '${Student.LName}', '${Student.Email}', ${Student.UniID}, '${Student.Role}')`);
        return result;
    } catch (error) {
        console.log(error);
    }
};

// Function to fetch all users
const getAllBasicUsers = async () => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`SELECT * FROM Students WHERE Role = 'user' `);
        return result.recordset;
    }

    catch (error) {
        console.log(error);
    }
};

// Function to promote user to admin
const promoteUser = async (userID) => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`
            UPDATE Students
            SET Role = 'admin'
            WHERE UID = ${userID};
            `);
        return result;
    }

    catch (error) {
        console.log(error);
    }
}

// Function to fetch all users
const getallUser = async () => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`SELECT * FROM Students`);
        return result.recordset;
    }

    catch (error) {
        console.log(error);
    }
};

// Function to fetch user based on email
const getUserEmail = async (email) => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`SELECT * FROM Students WHERE Email = '${email}'`);
        return result.recordset[0];
    }

    catch (error) {
        console.log(error);
    }
};

// Function to fetch uid  by username
const getStudentIDByUsername = async (username) => {
    try {
        const connect = await sql.connect(config);
        const result = await connect.request()
        .input('Username', sql.VarChar(100), username)
        .query('SELECT UID FROM Students WHERE Username = @Username');
        return result.recordset[0];
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

// Function to fetch uid by email
const getUIDByEmail = async (email) => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`SELECT UID FROM Students WHERE Email = '${email}'`);
        return result.recordset[0];
    }
    catch (error) {
        console.log(error);
    }
};

// Function to fetch all emails from Students table
const getAllEmails = async () => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`SELECT Email FROM Students`);
        return result.recordset;
    }
    catch (error) {
        console.log(error);
    }
};

// Function to fetch RSO by ID
const getRSOByID = async (rsoID) => {
    try {
        // Fetch RSO data
        let connect = await sql.connect(config);
        let rsoResult = await connect.request()
        .query(`
            SELECT
                r.RSO_ID, r.Name AS RSO_Name, r.Description, r.Status,
                u.UniversityID AS University_UID, u.Name AS University_Name,
                s.UID AS Admin_UID, s.Username AS Admin_Username, s.Email AS Admin_Email
            FROM RSO r
            JOIN University u ON r.UniversityID = u.UniversityID
            JOIN Students s ON r.AdminID = s.UID
            WHERE RSO_ID = ${rsoID}
        `);

        const rsoData = rsoResult.recordset[0];

        // Fetch RSO members
        let membersResult = await connect.request()
        .query(`
            SELECT
                m.StudentID, m.JoinDate,
                s.Username, s.Email
            FROM RSO_Members m
            JOIN Students s ON m.StudentID = s.UID
            WHERE RSO_ID = ${rsoID}
            `);

        // Map members list
        const members = membersResult.recordset.map(row => ({
            uid: row.StudentID,
            username: row.Username,
            email: row.Email,
            joinDate: row.JoinDate
        }));

        // format the results
        return {
            rso: {
                id: rsoData.RSO_ID,
                name: rsoData.RSO_Name,
                description: rsoData.Description,
                status: rsoData.Status
            },
            university: {
                uid: rsoData.University_UID,
                name: rsoData.University_Name
            },
            admin: {
                uid: rsoData.Admin_UID,
                username: rsoData.Admin_Username,
                email: rsoData.Admin_Email
            },
            members
        };
    }

    catch (error) {
        console.log(error);
        throw error;
    }
};

// Function to add a new RSO to the sql database and return the inserted user [WORK IN PROGRESS]
const createRSO = async (rso) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('name', sql.VarChar, rso.Name)
        .input('description', sql.VarChar, rso.Description)
        .input('adminId', sql.Int, rso.AdminID)
        .input('universityId', sql.Int, rso.UniversityID)
        .input('status', sql.Int, rso.Status)
        .query(`
          INSERT INTO RSO (Name, Description, AdminID, UniversityID, Status)
          VALUES (@name, @description, @adminId, @universityId, @status)
        `);
      return result;
    } catch (err) {
      console.error("SQL error in createRSO():", err);
      throw err;
    }
};

// Function to fetch all RSOS from sql database
const getRSOs = async () => {
    try {
        let connect = await sql.connect(config);
        let results = await connect.request().query("SELECT * FROM RSO;");
        return results.recordset;
    }

    catch (error) {
        console.log(error);
        throw error;
    }
};

// get rso by name
const getRSOByName = async (name) => {
    try {
        const connect = await sql.connect(config);
        const result = await connect.request()
        .input('name', sql.VarChar, name)
        .query(`
            SELECT * FROM RSO
            WHERE Name = @name;
          `);
        return result.recordset[0];
    }
    catch (err) {
        console.error("Error fetching RSO:", err);
        throw err;
    }
};

// Function for pending RSO request from DB
const getPendingRSORequests = async () => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request()
        .query(`
            SELECT 
                r.RSO_ID, r.Name AS RSO_Name, r.Description, r.Status,
                u.UniversityID AS University_UID, u.Name AS University_Name,
                s.UID AS Admin_UID, s.Username AS Admin_Username, s.Email AS Admin_Email
            FROM RSO r
            JOIN University u ON r.UniversityID = u.UniversityID
            JOIN Students s ON r.AdminID = s.UID
            WHERE r.Status = 0
        `);

        // format the results
        return result.recordset.map(row => ({
            rso: {
                id: row.RSO_ID,
                name: row.RSO_Name,
                description: row.Description,
                status: row.Status
            },
            university: {
                uid: row.University_UID,
                name: row.University_Name
            },
            admin: {
                uid: row.Admin_UID,
                username: row.Admin_Username,
                email: row.Admin_Email
            }
        }));
    }
    catch (error) {
        console.error("Error fetching pending RSOs:", error);
    }
};

// Function for updating an RSO
const updateRSO = async (id, changes) => {
    try {
        const keys = Object.keys(changes);

        if (keys.length !== 0) {
            let connect = await sql.connect(config);
            const request = connect.request();
    
            // Map changes to attributes in db
            const setClause = keys.map((key, index) => {
                request.input(key, changes[key]);
                return `[${key}] = @${key}`;
            }).join(', ');
    
            const query = `UPDATE RSO SET ${setClause} WHERE RSO_ID = @id;`;
            request.input('id', id);
    
            await request.query(query);
            return { success: true };
        }

        else {
            console.log('No fields provided to update');
        }
    }

    catch (error) {
        console.log(error);
    }
};

// Function to delete an RSO
const deleteRSO = async (id) => {
    try {
        let connect = await sql.connect(config);
        let result = await connect.request().query(`DELETE FROM RSO WHERE RSO_ID = ${id};`);
        return { success: true };
    }

    catch (error) {
        console.log(error);
    }
};

// Function to fetch all RSOs for a user
const getUserRSOs = async (userID) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query(`
                SELECT r.RSO_ID, r.Name
                FROM RSO r
                INNER JOIN RSO_Members m ON r.RSO_ID = m.RSO_ID
                WHERE m.StudentID = @userID
            `);
        return result.recordset;
    } catch (error) {
        console.error("Error in getUserRSOs:", error);
        throw error;
    }
};

// Function to add user to RSO
const addUserRSO = async (userID, rsoID) => {
    try {
        const connect = await sql.connect(config);
        const result = await connect.request()
        .query(`INSERT INTO RSO_Members VALUES (${rsoID}, ${userID}, GETDATE());`);
        return result;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};

// Function to add multiple users to RSO in a single query
const addUsersToRSO = async (userIDs, rsoID) => {
    try {
        const connect = await sql.connect(config);

        // Create the values part of the insert statement dynamically
        const values = userIDs.map(userID => `(${rsoID}, ${userID}, GETDATE())`).join(', ');

        // Insert all users in one query
        const query = `INSERT INTO RSO_Members (RSO_ID, StudentID, JoinDate) VALUES ${values}`;
        
        // Execute the query
        const result = await connect.request().query(query);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Function to add user to RSO
const removeUserRSO = async (userID, rsoID) => {
    try {
        const connect = await sql.connect(config);
        const result = await connect.request()
        .query(`
            DELETE FROM RSO_Members
            WHERE RSO_ID = ${rsoID} AND StudentID = ${userID};`);
        return result;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};

// Function to fetch all Universities from sql database
const getUniversities = async () => {
    try {
        let connect = await sql.connect(config);
        let schools = await connect.request().query("SELECT * FROM University;");
        return schools.recordset;
    }

    catch (error) {
        console.log(error);
        throw error;
    }
};

// Function to fetch a University by ID
const getUniversityByID = async (universityID) => {
    try {
        const connect = await sql.connect(config);
        const result = await connect.request()
        .input('UniversityID', sql.Int, universityID)
        .query('SELECT * FROM Locations WHERE UniversityID = @UniversityID');

        return result.recordset;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};

// Function to add a new University to the sql database
const createUniversity = async (University) => {
    try {
        let connect = await sql.connect(config);
        let result = connect.request()
            .query(`INSERT INTO University VALUES
            ('${University.Name}', '${University.Location}', '${University.Description}', ${University.NumberOfStudents}, '${University.Pictures}')`);
        return result;
    }

    catch (error) {
        console.log(error);
    }
};

// Function to fetch all events from the database
const getAllEvents = async () => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query(`
                SELECT 
                    e.EventID, e.Name, e.Category, e.Description, e.EventDate, e.EventTime, 
                    e.ContactPhone, e.ContactEmail, e.EventType, e.UniversityID, e.LocID,
                    l.Name AS LocationName
                FROM 
                    Events e
                LEFT JOIN 
                    Locations l ON e.LocID = l.LocID
            `);
        return result.recordset;
    }
    catch (error) {
        console.log(error);
    }
};

// Function to fetch events with access filter
const getEventsWithAccessFilter = async (universityID, userID) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('universityID', sql.Int, universityID)
            .input('userID', sql.Int, userID)
            .query(`
                SELECT 
                    e.EventID, e.Name, e.Category, e.Description, e.EventDate, e.EventTime, 
                    e.ContactPhone, e.ContactEmail, e.EventType, e.UniversityID, e.LocID,
                    l.Name AS LocationName
                FROM Events e
                LEFT JOIN Locations l ON e.LocID = l.LocID
                WHERE 
                    e.EventType = 'public'
                    OR (e.EventType = 'private' AND e.UniversityID = @universityID)
                    OR (e.EventType = 'RSO' AND e.RSO_ID IN (
                        SELECT RSO_ID FROM RSO_Members WHERE StudentID = @userID
                    ))
            `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching filtered events:", error);
        throw error;
    }
};

// Function to delete an event
const deleteEvent = async (eventId) => {
    try {
        const pool = await sql.connect(config);
        
        // Delete related comments first
        await pool.request()
            .input('EventID', sql.Int, eventId)
            .query(`DELETE FROM Comments WHERE EventID = @EventID`);
        
        // Now delete the event
        await pool.request()
            .input('EventID', sql.Int, eventId)
            .query(`DELETE FROM Events WHERE EventID = @EventID`);
    } catch (error) {
        console.error("Error deleting event:", error);
    }
};


const checkEventConflict = async (eventDate, eventTime, locID) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('eventDate', sql.Date, eventDate)
            .input('eventTime', sql.VarChar(255), eventTime)
            .input('locID', sql.Int, locID)
            .query(`
                SELECT * FROM Events
                WHERE EventDate = @eventDate AND EventTime = @eventTime AND LocID = @locID
            `);

        return result.recordset.length > 0;
    } catch (error) {
        console.error("Error checking event conflict:", error);
        throw error;
    }
};


// Save Comment
const saveComment = async (EventID, StudentID, CommentText, Rating) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('EventID', sql.Int, EventID)
            .input('StudentID', sql.Int, StudentID)
            .input('CommentText', sql.NVarChar(sql.MAX), CommentText)
            .input('Rating', sql.Int, Rating)
            .query(`INSERT INTO Comments (EventID, StudentID, CommentText, Rating) 
                    VALUES (@EventID, @StudentID, @CommentText, @Rating)`);
    } catch (error) {
        console.log(error);
    }
};

// Fetch Comments for a Specific Event
const getCommentsForEvent = async (EventID) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('EventID', sql.Int, EventID)
            .query(`
                SELECT c.CommentID, c.CommentText, c.Rating, c.Timestamp, s.Username AS Username
                FROM Comments c
                INNER JOIN Students s ON c.StudentID = s.UID
                WHERE c.EventID = @EventID
                ORDER BY c.Timestamp DESC
            `);
        return result.recordset;
    } catch (error) {
        console.log(error);
    }
};

// Edit Comment
const editComment = async (CommentID, CommentText, Rating) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('CommentID', sql.Int, CommentID)
            .input('CommentText', sql.NVarChar(sql.MAX), CommentText)
            .input('Rating', sql.Int, Rating)
            .query(`UPDATE Comments SET CommentText = @CommentText, Rating = @Rating WHERE CommentID = @CommentID`);
    } catch (error) {
        console.log(error);
    }
};

// Delete Comment
const deleteComment = async (CommentID) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('CommentID', sql.Int, CommentID)
            .query(`DELETE FROM Comments WHERE CommentID = @CommentID`);
    } catch (error) {
        console.log(error);
    }
};

// Fetch a specific comment by ID
const getCommentById = async (commentId) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('CommentID', sql.Int, commentId)
            .query(`SELECT * FROM Comments WHERE CommentID = @CommentID`);
        
        return result.recordset[0];
    } catch (error) {
        console.log("Error fetching comment by ID:", error);
    }
};

// Create Event Function
async function createEvent(eventData) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('name', sql.VarChar(255), eventData.name)
            .input('category', sql.VarChar(255), eventData.category)
            .input('description', sql.Text, eventData.description)
            .input('eventDate', sql.Date, eventData.eventDate)
            .input('eventTime', sql.VarChar(255), eventData.eventTime)
            .input('contactEmail', sql.VarChar(255), eventData.contactEmail)
            .input('contactPhone', sql.VarChar(255), eventData.contactPhone)
            .input('eventType', sql.VarChar(255), eventData.eventType)
            .input('locID', sql.Int, eventData.locID)
            .input('universityID', sql.Int, eventData.universityID)
            .input('rsoID', sql.Int, eventData.rsoID || null)
            .query(`
                INSERT INTO Events (Name, Category, Description, EventDate, EventTime, ContactEmail, ContactPhone, EventType, LocID, UniversityID, RSO_ID)
                VALUES (@name, @category, @description, @eventDate, @eventTime, @contactEmail, @contactPhone, @eventType, @locID, @universityID, @rsoID)
            `);

        return result.recordset;
    } catch (error) {
        console.error("Error creating event:", error);
    }
}

const runSQLFile = async (filePath) => {
    try {
        const pool = await sql.connect(config);
        const sqlScript = fs.readFileSync(filePath, 'utf-8');

        await pool.request().query(sqlScript);
        console.log('SQL file executed successfully');
    } catch (error) {
        console.error('Error executing SQL file:', error);
    }
};

module.exports = {
    saveLocation,
    getLocations,
    runSQLFile,
    createEvent,
    getAllEvents,
    getEventsWithAccessFilter,
    deleteEvent,
    getUniversities,
    getUniversityByID,
    createUniversity,
    getUser,
    getallUser,
    getAllBasicUsers,
    promoteUser,
    getUserEmail,
    getStudentIDByUsername,
    getUIDByEmail,
    getAllEmails,
    createStudent,
    //checkEventOverlap,
    checkEventConflict,
    saveComment,
    getCommentsForEvent,
    editComment,
    deleteComment,
    getCommentById,
    getPendingRSORequests,
    updateRSO,
    getRSOByID,
    createRSO,
    deleteRSO,
    getUserRSOs,
    addUserRSO,
    removeUserRSO,
    getRSOByName,
    getRSOs,
    addUsersToRSO
};