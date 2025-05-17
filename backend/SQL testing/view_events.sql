-- View events with joined University and Location info
SELECT 
    e.Name AS EventName,
    e.Category,
    e.EventDate,
    e.EventTime,
    e.Status,
    u.Name AS University,
    l.Name AS Location,
    l.Description AS LocationDescription
FROM Events e
JOIN University u ON e.UniversityID = u.UID
JOIN Locations l ON e.LocID = l.LocID;
GO
