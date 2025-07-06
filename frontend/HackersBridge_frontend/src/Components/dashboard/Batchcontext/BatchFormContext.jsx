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


    const fetchBatches = async ({ page = 1, pageSize = 30, search = '', mode = '', language = '', preferred_week = '', location = '', status = ''  }) => {
        if (loading) return;
       
        // const token = localStorage.getItem('token');
        // if (!token) {
        //     console.error("No token found, user might be logged out.");
        //     return;
        // };

        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/batches/`,
              { headers: { 'Content-Type': 'application/json'},
              withCredentials : true,
              params: {
                page,
                page_size: pageSize,
                search,
                mode,
                language,
                preferred_week,
                location,
                status
              }
            }
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
    };




  return (
    <BatchFormContext.Provider value={{ batchFormData, loading, setBatchFormData, errors, setErrors,  resetBatchForm, batchData, setBatchData, fetchBatches }}>
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
