import axios from "axios";
import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import BASE_URL from "../../../ip/Ip";

// Create the context object
const BatchFormContext = createContext();


const initialFormData = {
  batchId : "",
  batchTime: "",
  startDate: "",
  endDate: "",
  course: "",
  trainer: "",
  preferredWeek: "",
  mode: "",
  language: "",
  location: "",
  student : [],
  status : "",
}

const BatchFormProvider = ({ children }) => {
  const [batchFormData, setBatchFormData] = useState(initialFormData);
  const [batchData, setBatchData] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  
    // Function to reset form
    const resetBatchForm = useCallback(() => {
      setBatchFormData(initialFormData);
    }, []);

    const fetchBatches = useCallback (async () => {
        if (loading) return;
       
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };

        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/batches/`,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            const data = response.data;
            // console.log(data);
            
            setBatchData(prevData => {
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

      // COUNT BATCHES BASED ON THEIR STATUS TO DISPLAY IN BADGES
      const countBatchesByType = useMemo(() => ({ 
        all: batchData?.All_Type_Batch?.batches?.length || 0,
        running: batchData?.All_Type_Batch?.running_batch?.length || 0,
        scheduled: batchData?.All_Type_Batch?.scheduled_batch?.length || 0,
        endingsoon: batchData?.All_Type_Batch?.batches_ending_soon?.length || 0,
        hold: batchData?.All_Type_Batch?.hold_batch?.length || 0,
        completed: batchData?.All_Type_Batch?.completed_batch?.length || 0,
        cancelled: batchData?.All_Type_Batch?.cancelled_batch?.length || 0,
    }), [batchData]);
    



  return (
    <BatchFormContext.Provider value={{ batchFormData, loading, setBatchFormData, errors, setErrors,  resetBatchForm, batchData, setBatchData, fetchBatches, countBatchesByType }}>
      {children}
    </BatchFormContext.Provider>
  );
};

// Custom hook to access context
const useBatchForm = () => {
  const context = useContext(BatchFormContext);
  if (!context) {
    throw new Error("useBatchForm must be used within a BatchFormProvider");
  }
  return context;
};

export { BatchFormProvider, useBatchForm }; // Named exports
