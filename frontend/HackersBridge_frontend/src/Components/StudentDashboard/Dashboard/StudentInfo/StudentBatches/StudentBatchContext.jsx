import axios from "axios";
import React, { createContext, useState, useContext, useCallback } from "react";
import BASE_URL from "../../../../../ip/Ip";

// Create the context object
const StudentBatchContext = createContext();



const StudentBatchProvider = ({ children }) => {
  const [studentBatch, setStudentBatch] = useState();
  const [loading, setLoading] = useState(false);
  const [studentBatchInfo, setStudentBatchInfo] = useState();
  const [studentRecommendedBatch, setStudentRecommendedBatch] = useState();


    // FETCH ALL THE BATCHES OF STUDENT
    const fetchStudentBatches = useCallback (async () => {
        if (loading) return;
       
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };

        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/Student_login/student_batch/`,
              { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
              withCredentials: true,
            }  
            );
            const data = response.data;
            // console.log(data);
            
            setStudentBatch(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

            // console.log('Batches Data ', data)
        } catch (error) {
          console.error('Error fetching Batches Data', error);
        } finally {
          setLoading(false);
        }
    }, [loading]);


    // FETCH BATCH INFO OF SPEIFIC BATCH 
    const fetchStudentBatcheInfo = useCallback (async (batchId) => {
      if (!batchId) return;
            
      const token = localStorage.getItem('token');
      if (!token) {
          console.error("No token found, user might be logged out.");
          return;
      };

      setLoading(true);
      try {
          const response = await axios.get(`${BASE_URL}/Student_login/student_batch_info/${batchId}/`,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
            withCredentials: true,
          }  
          );
          const data = response.data;
          // console.log(data);
          
          setStudentBatchInfo(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
              return data;
            }
            return prevData;
          });

          // console.log('Batches Data ', data)
      } catch (error) {
        console.error('Error fetching Batches Data', error);
      } finally {
        setLoading(false);
      }
  }, [loading]);


    // FETCH RECOMMENDED BATCH OF THAT STUDENT
    const fetchStudentRecommendedBatches = useCallback(async () => {
        if (loading) return;
         
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };
  
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/Student_login/student_batch_upcoming/`,
              { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
              withCredentials: true,
            }  
            );
            const data = response.data;
            // console.log(data);
            
            setStudentRecommendedBatch(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });
  
            // console.log('Batches Data ', data)
        } catch (error) {
          console.error('Error fetching Batches Data', error);
        } finally {
          setLoading(false);
        }
      }, [loading]);

  return (
    <StudentBatchContext.Provider value={{ loading, studentBatch, fetchStudentBatches, studentBatchInfo, fetchStudentBatcheInfo, studentRecommendedBatch, fetchStudentRecommendedBatches }}>
      {children}
    </StudentBatchContext.Provider>
  );
};

// Custom hook to access context
const useStudentBatch = () => {
  const context = useContext(StudentBatchContext);
  if (!context) {
    throw new Error("useStudentBatch must be used within a StudentBatchProvider");
  }
  return context;
};

export { StudentBatchProvider, useStudentBatch }; // Named exports
