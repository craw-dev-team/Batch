import axios from "axios";
import React, { createContext, useState, useContext, useCallback } from "react";
import BASE_URL from "../../../../../ip/Ip";


// Create the Context Object
const StudentCertificateContext = createContext();

const StudentCertificateProvider = ({ children }) => {
    const [studentCertificate, setStudentCertificate] = useState();
    const [loading, setLoading] = useState(false);
  
  
      const fetchStudentCertificate = useCallback (async () => {
          if (loading) return; 
          const token = localStorage.getItem('token');
          if (!token) {
              console.error("No token found, user might be logged out.");
              return;
          };
  
          setLoading(true);
          try {
              const response = await axios.get(`${BASE_URL}/Student_login/student_certificates/`,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials: true,
              }  
              );
              const data = response.data;
              // console.log(response);
              
              setStudentCertificate(prevData => {
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
  