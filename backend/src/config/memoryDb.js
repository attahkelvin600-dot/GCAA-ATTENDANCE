// In-memory database for testing (before PostgreSQL setup)
// This allows the app to work without a real database

class MemoryDatabase {
  constructor() {
    this.personnel = [];
    this.attendance = [];
    this.nextPersonnelId = 1;
    this.nextAttendanceId = 1;
  }

  // Personnel operations
  createPersonnel(data) {
    const personnel = {
      id: this.nextPersonnelId++,
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.personnel.push(personnel);
    return personnel;
  }

  getPersonnelByEmail(email) {
    return this.personnel.find(p => p.email === email);
  }

  getPersonnelById(id) {
    return this.personnel.find(p => p.id === parseInt(id));
  }

  getAllPersonnel() {
    return this.personnel;
  }

  updatePersonnel(id, data) {
    const index = this.personnel.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      this.personnel[index] = { ...this.personnel[index], ...data, updated_at: new Date() };
      return this.personnel[index];
    }
    return null;
  }

  deletePersonnel(id) {
    const index = this.personnel.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      this.personnel.splice(index, 1);
      return true;
    }
    return false;
  }

  // Attendance operations
  createAttendance(data) {
    const attendance = {
      id: this.nextAttendanceId++,
      ...data,
      created_at: new Date()
    };
    this.attendance.push(attendance);
    return attendance;
  }

  getAttendanceByPersonnelAndDate(personnelId, date) {
    const dateStr = new Date(date).toDateString();
    return this.attendance.find(a => 
      a.personnel_id === parseInt(personnelId) && 
      new Date(a.check_in_time).toDateString() === dateStr &&
      !a.check_out_time
    );
  }

  getAttendanceRecords(filters) {
    let results = [...this.attendance];
    
    if (filters.personnel_id) {
      results = results.filter(a => a.personnel_id === parseInt(filters.personnel_id));
    }
    
    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      results = results.filter(a => new Date(a.check_in_time) >= startDate);
    }
    
    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      results = results.filter(a => new Date(a.check_in_time) <= endDate);
    }
    
    return results.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));
  }

  updateAttendance(id, data) {
    const index = this.attendance.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      this.attendance[index] = { ...this.attendance[index], ...data, updated_at: new Date() };
      return this.attendance[index];
    }
    return null;
  }

  getDailyReport(date) {
    const dateStr = new Date(date).toDateString();
    const report = [];

    this.personnel.forEach(person => {
      const attendance = this.attendance.find(a =>
        a.personnel_id === person.id &&
        new Date(a.check_in_time).toDateString() === dateStr
      );

      report.push({
        id: person.id,
        name: person.name,
        employee_id: person.employee_id,
        check_in: attendance ? attendance.check_in_time : 'Not checked in',
        check_out: attendance ? attendance.check_out_time : 'Not checked out',
        status: !attendance ? 'Absent' : !attendance.check_out_time ? 'Still In' : 'Present'
      });
    });

    return report;
  }
}

// Create singleton instance
const db = new MemoryDatabase();

module.exports = db;
