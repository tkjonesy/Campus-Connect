USE CampusConnect
GO

CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    EventID INT NOT NULL,
    StudentID INT NOT NULL,
    CommentText NVARCHAR(MAX) NOT NULL,
    Timestamp DATETIME DEFAULT GETDATE(),
    Rating INT CHECK (Rating BETWEEN 1 AND 5)
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    FOREIGN KEY (StudentID) REFERENCES Students(UID)
);
