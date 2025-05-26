import axios from "axios";
import React, { createContext, useState, useContext, useCallback } from "react";
import BASE_URL from "../../../../../ip/Ip";


// Create the Context Object
const StudentAttendanceContext = createContext();

const StudentAttendanceProvider = ({ children }) => {
    const [studentAttendance, setStudentAttendance] = useState();
    const [loading, setLoading] = useState(false);
  
  
      const fetchStudentAttendance = useCallback (async () => {
          if (loading) return; 
          const token = localStorage.getItem('token');
          if (!token) {
              console.error("No token found, user might be logged out.");
              return;
          };
  
          setLoading(true);
          try {
              const response = await axios.get(`${BASE_URL}/Student_login/student_attendance_batchlist/`,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials: true,
              }  
              );
              const data = response.data;
              // console.log(data);
              
              setStudentAttendance(prevData => {
                if(JSON.stringify(prevData) !== JSON.stringify(data)){
                  return data;
                }
                return prevData;
              });
  
              // console.log('Batches Data ', data)
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
  