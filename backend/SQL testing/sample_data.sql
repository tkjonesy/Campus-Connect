-- Insert a university
INSERT INTO University (Name, Location, Description, NumberOfStudents, Pictures)
VALUES ('University of Central Florida', 'Orlando, FL', 'Biggest university in the US', 70000, 'ucf.jpg');

-- Insert a location
INSERT INTO Locations (Name, Description, Longitude, Latitude)
VALUES ('Engineering Building', 'Main event hall', -81.2001, 28.6024);

-- Insert an event
INSERT INTO Events (Name, Category, Description, EventDate, EventTime, ContactPhone, ContactEmail, EventType, RSO_ID, UniversityID, LocID, Status)
VALUES (
    'Tech Talk: AI in 2025', 'Tech Talk', 'Join us to explore the future of AI.',
    '2025-04-10', '17:00:00', '555-1234', 'admin@knights.ucf.edu',
    'Public', NULL, 1, 1, 'approved'
);
INSERT INTO Events (Name, Category, Description, EventDate, EventTime, ContactPhone, ContactEmail, EventType, UniversityID, LocID)
VALUES (
    'Soccer Game',
    'Soccer',
    'A 1 hour soccer game.',
    '2025-04-10',
    '09:00',
    '123-456-7890',
    'info@ucf.edu',
    'Public',
    1,  -- Make sure this matches the Student's UniversityID
    1   -- Assuming you have a location with LocID = 1
);

INSERT INTO Events (Name, Category, Description, EventDate, EventTime, ContactPhone, ContactEmail, EventType, UniversityID, LocID, Status)
VALUES (
    'Test Event',
    'General',
    'This is a test event for troubleshooting.',
    '2025-04-10',
    '09:00',
    '555-0000',
    'test@ucf.edu',
    'Public',
    1,   -- Make sure UniversityID exists
    1,   -- Make sure LocID exists
    'approved'
);
