-- This is just for reporting/loggin purposes and is not actually our database

CREATE TABLE University (
    UniversityID INT IDENTITY(1,1),
    Name VARCHAR(100) UNIQUE NOT NULL,
    Location VARCHAR(255),
    Description TEXT,
    NumberOfStudents INT CHECK (NumberOfStudents >= 0),
    Pictures VARCHAR(255),
    PRIMARY KEY (UniversityID)
);

CREATE TABLE Students (
    UID INT IDENTITY(1,1),
    Username VARCHAR(20) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Firstname VARCHAR(50) NOT NULL,
    Lastname VARCHAR(50) NOT NULL,
    Email VARCHAR(50) UNIQUE NOT NULL,
    UniversityID INT,
    Role VARCHAR(5) DEFAULT 'user',
    PRIMARY KEY (uid),
    FOREIGN KEY (UniversityID) REFERENCES University ON DELETE SET NULL
);

CREATE TABLE Locations (
    LocID INT IDENTITY(1,1),
    Name VARCHAR(20),
    Description TEXT,
    Longitude REAL,
    Latitude REAL,
    PRIMARY KEY (LocID)
);