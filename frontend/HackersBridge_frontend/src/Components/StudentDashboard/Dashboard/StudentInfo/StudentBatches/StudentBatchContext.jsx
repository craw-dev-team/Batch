import React, { createContext, useState, useContext, useCallback } from "react";
import axiosInstance from "../../../../dashboard/api/api";


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

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/Student_login/student_batch/` );
            const data = response.data;
            console.log(data);
            
            setStudentBatch(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

        } catch (error) {
          console.error('Error fetching Batches Data', error);
        } finally {
          setLoading(false);
        }
    }, [loading]);


    // FETCH BATCH INFO OF SPEIFIC BATCH 
    const fetchStudentBatcheInfo = useCallback (async (batchId) => {
      if (!batchId) return;

      setLoading(true);
      try {
          const response = await axiosInstance.get(`/Student_login/student_batch_info/${batchId}/` );
          const data = response.data;
          
          setStudentBatchInfo(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
              return data;
            }
            return prevData;
          });

      } catch (error) {
        console.error('Error fetching Batches Data', error);
      } finally {
        setLoading(false);
      }
  }, [loading]);


    // FETCH RECOMMENDED BATCH OF THAT STUDENT
    const fetchStudentRecommendedBatches = useCallback(async () => {
        if (loading) return;
  
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/Student_login/student_batch_upcoming/`);
            const data = response.data;
            
            setStudentRecommendedBatch(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });
  
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
