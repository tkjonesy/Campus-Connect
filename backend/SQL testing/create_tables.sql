USE CampusConnect;
GO
-- Table: University
CREATE TABLE University (
    UID INT IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(255),
    Description TEXT,
    NumberOfStudents INT CHECK (NumberOfStudents >= 0),
    Pictures VARCHAR(255),
    PRIMARY KEY (UID)
);
GO --checked

-- Table: Students
CREATE TABLE Students (
    UID INT IDENTITY(1,1),
    Username VARCHAR(20) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Firstname VARCHAR(50) NOT NULL,
    Lastname VARCHAR(50) NOT NULL,
    Email VARCHAR(50) UNIQUE NOT NULL,
    UniversityID INT,
    PRIMARY KEY (UID)
);
GO --checked

-- Table: Locations
CREATE TABLE Locations (
    LocID INT IDENTITY(1,1),
    Name VARCHAR(50),
    Description TEXT,
    Longitude REAL,
    Latitude REAL,
    PRIMARY KEY (LocID)
);
GO --checked

-- Table: Events
CREATE TABLE Events (
    EventID INT IDENTITY(1,1),
    Name VARCHAR(255) NOT NULL,
    Category VARCHAR(100),
    Description TEXT,
    EventDate DATE,
    EventTime TIME,
    ContactPhone VARCHAR(20),
    ContactEmail VARCHAR(100),
    EventType VARCHAR(50),
    RSO_ID INT NULL,
    UniversityID INT NOT NULL,
    LocID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'pending',
    PRIMARY KEY (EventID)
);
GO --checked

-- Table: RSO
CREATE TABLE RSO (
    RSO_ID INT IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    AdminID INT NOT NULL,
    UniversityID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'inactive',
    PRIMARY KEY (RSO_ID)
);
GO --checked

-- Table: RSO_Members
CREATE TABLE RSO_Members (
    RSO_ID INT,
    StudentID INT,
    JoinDate DATE DEFAULT GETDATE(),
    PRIMARY KEY (RSO_ID, StudentID)
);
GO --checked

-- Table: Comments
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1),
    EventID INT NOT NULL,
    StudentID INT NOT NULL,
    CommentText TEXT NOT NULL,
    Timestamp DATETIME DEFAULT GETDATE(),
    Rating INT NOT NULL,
    PRIMARY KEY (CommentID)
);
GO --checked

-- Table: Ratings
CREATE TABLE Ratings (
    RatingID INT IDENTITY(1,1),
    EventID INT NOT NULL,
    StudentID INT NOT NULL,
    Stars INT CHECK (Stars BETWEEN 1 AND 5),
    PRIMARY KEY (RatingID)
);
GO --checked


