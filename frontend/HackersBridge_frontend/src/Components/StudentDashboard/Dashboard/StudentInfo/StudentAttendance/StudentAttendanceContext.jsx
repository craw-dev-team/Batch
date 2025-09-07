import React, { createContext, useState, useContext, useCallback } from "react";
import axiosInstance from "../../../../dashboard/api/api";


// Create the Context Object
const StudentAttendanceContext = createContext();

const StudentAttendanceProvider = ({ children }) => {
    const [studentAttendance, setStudentAttendance] = useState();
    const [loading, setLoading] = useState(false);
  
  
      const fetchStudentAttendance = useCallback (async () => {
          if (loading) return; 
  
          setLoading(true);
          try {
              const response = await axiosInstance.get(`/Student_login/student_attendance_batchlist/` );
              const data = response.data;
              
              setStudentAttendance(prevData => {
                if(JSON.stringify(prevData) !== JSON.stringify(data)){
                  return data;
                }
                return prevData;
              });
  
          } catch (error) {
            console.error('Error fetching Attendance Data', error);
          } finally {
            setLoading(false);
          }
      }, [loading]);
  
    return (
      <StudentAttendanceContext.Provider value={{ loading, studentAttendance, setStudentAttendance, fetchStudentAttendance }}>
        {children}
      </StudentAttendanceContext.Provider>
    );
  };
  
  // Custom hook to access context
  const useStudentAttendance = () => {
    const context = useContext(StudentAttendanceContext);
    if (!context) {
      throw new Error("useStudentAttendance must be used within a StudentAttendanceProvider");
    }
    return context;
  };
  
  export { StudentAttendanceProvider, useStudentAttendance }; // Named exports
  