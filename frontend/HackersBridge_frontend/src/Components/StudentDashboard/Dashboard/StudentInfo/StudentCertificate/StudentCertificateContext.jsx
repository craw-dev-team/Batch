import React, { createContext, useState, useContext, useCallback } from "react";
import axiosInstance from "../../../../dashboard/api/api";


// Create the Context Object
const StudentCertificateContext = createContext();

const StudentCertificateProvider = ({ children }) => {
    const [studentCertificate, setStudentCertificate] = useState();
    const [loading, setLoading] = useState(false);
  
  
      const fetchStudentCertificate = useCallback (async () => {
          if (loading) return; 
  
          setLoading(true);
          try {
              const response = await axiosInstance.get(`/Student_login/student_certificates/`,
                { headers: { 'Content-Type': 'application/json'}, 
                withCredentials: true,
              }  
              );
              const data = response.data;
              
              setStudentCertificate(prevData => {
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
      <StudentCertificateContext.Provider value={{ loading, studentCertificate, setStudentCertificate, fetchStudentCertificate }}>
        {children}
      </StudentCertificateContext.Provider>
    );
  };
  
  // Custom hook to access context
  const useStudentCertificate = () => {
    const context = useContext(StudentCertificateContext);
    if (!context) {
      throw new Error("useStudentCertificate must be used within a StudentCertificateProvider");
    }
    return context;
  };
  
  export { StudentCertificateProvider, useStudentCertificate }; // Named exports
  