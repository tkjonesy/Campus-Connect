USE CampusConnect;
GO

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS RSOStatus;
GO

-- Create the new trigger
CREATE TRIGGER RSOStatus
ON RSO_Members
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @rso_id INT;

    -- Get the RSO_ID from either inserted or deleted rows
    IF EXISTS (SELECT * FROM inserted)
    BEGIN
        SELECT TOP 1 @rso_id = RSO_ID FROM inserted;
    END
    ELSE IF EXISTS (SELECT * FROM deleted)
    BEGIN
        SELECT TOP 1 @rso_id = RSO_ID FROM deleted;
    END

    -- Count how many members the RSO has now
    DECLARE @member_count INT;
    SELECT @member_count = COUNT(*) FROM RSO_Members WHERE RSO_ID = @rso_id;

    -- If fewer than 5 members, delete the RSO
    IF @member_count < 5
    BEGIN
        DELETE FROM RSO WHERE RSO_ID = @rso_id;
    END
    -- Otherwise, do nothing
END;
GO