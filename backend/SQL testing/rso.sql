-- Table: RSO (Registered Student Organization)
CREATE TABLE RSO (
    RSO_ID INT IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    AdminID INT NOT NULL, -- References a student who manages it
    UniversityID INT NOT NULL,

    PRIMARY KEY (RSO_ID),
    FOREIGN KEY (AdminID) REFERENCES Students(UID),
    FOREIGN KEY (UniversityID) REFERENCES University(UID)
);
GO

-- Table: RSO_Members (students who joined the RSO)
CREATE TABLE RSO_Members (
    RSO_ID INT,
    StudentID INT,
    JoinDate DATE DEFAULT GETDATE(),
    PRIMARY KEY (RSO_ID, StudentID),
    FOREIGN KEY (RSO_ID) REFERENCES RSO(RSO_ID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Users(StudentID) ON DELETE CASCADE
);
GO

-- Table: Comments (event discussion/comments)
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1),
    EventID INT NOT NULL,
    StudentID INT NOT NULL,
    CommentText TEXT NOT NULL,
    Timestamp DATETIME DEFAULT GETDATE(),

    PRIMARY KEY (CommentID),
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    FOREIGN KEY (StudentID) REFERENCES Students(UID)
);
GO

-- Table: Ratings (event ratings 1–5)
CREATE TABLE Ratings (
    RatingID INT IDENTITY(1,1),
    EventID INT NOT NULL,
    StudentID INT NOT NULL,
    Stars INT CHECK (Stars BETWEEN 1 AND 5),

    PRIMARY KEY (RatingID),
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    FOREIGN KEY (StudentID) REFERENCES Students(UID)
);
GO
