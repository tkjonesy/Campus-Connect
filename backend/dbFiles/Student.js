class Student {
    constructor(Username, PassHash, FName, LName, Email, UniID, Role) {
        this.Username = Username,
        this.PassHash = PassHash,
        this.FName = FName,
        this.LName = LName,
        this.Email = Email,
        this.UniID = UniID,
        this.Role = Role
    }
}

module.exports = Student;