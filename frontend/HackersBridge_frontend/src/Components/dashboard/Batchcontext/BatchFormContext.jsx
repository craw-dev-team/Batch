
import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import axiosInstance from "../api/api";
import { message } from "antd";

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
  const [batchesCache, setBatchesCache] = useState({});
  const [loading, setLoading] = useState({
    all: false,
    delete: false
  });
  const [errors, setErrors] = useState({});

  
    // Function to reset form
    const resetBatchForm = useCallback(() => {
      setBatchFormData(initialFormData);
    }, []);

    // fetch all batch data 
    const fetchBatches = async (currentFilters = {}, forceFetch = false) => {
      const {
        status = '',
        page = 1,
        pageSize = 30,
        search = '',
        mode = '',
        language = '',
        preferred_week = '',
        location = ''
      } = currentFilters;

      // Create a cache key based on filters
      const cacheKey = `${status}_${page}_${pageSize}_${search}_${mode}_${language}_${preferred_week}_${location}`;

      // Use cached data if available
      // if (batchesCache[cacheKey]) {
      //   setBatchData(batchesCache[cacheKey]);
      //   return;
      // }

      if (!forceFetch && batchesCache[cacheKey]) {
          setBatchData(batchesCache[cacheKey]);
          return;
      }


      if (loading.all) return;

        setLoading(prev => ({...prev, all: true }));
        try {
            const response = await axiosInstance.get(`/api/batches/`,
              {
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
            
            setBatchData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

            // Save in cache
            setBatchesCache(prev => ({ ...prev, [cacheKey]: data }));

        } catch (error) {
          console.error('Error fetching Batches Data', error);
        } finally {
          setLoading(prev => ({...prev, all: false }) );
        }
    };


      // Delete batch 
      const handleDeleteBatch = async (batchId) => {
          if (!batchId) return;

          setLoading(prev => ({...prev, delete: true }));
          try {
              const response = await axiosInstance.delete(`/api/batches/delete/${batchId}/` );

              if (response.status >= 200 && response.status < 300) {
                  message.success('Student Deleted Successfully');
                  if (
                      batchData?.results &&
                      Array.isArray(batchData.results.batches)
                  ) {
                      setBatchData(prevBatch => {
                          const updatedBatches = prevBatch.results.batches.filter(
                              batch => String(batch.id) !== String(batchId)
                          );
      
                          // Update the batches in the corresponding status category
                          return {
                              ...prevBatch,
                              results: {
                                  ...prevBatch.results,
                                  batches: updatedBatches, // Update the batches array
                              },
                          };
                      });
              
                  } else {
                      console.error('batchData is not an array or properly structured');
                  }
              } else {
                  message.error('Failed to delete batch');
              }
              
    
          } catch (error) {          
              if (error.response) {
                  console.error("Server Error Response:", error.response.data);
          
                  // Extract error messages and show each one separately
                  Object.entries(error.response.data).forEach(([key, value]) => {
                      value.forEach((msg) => {
                          message.error(`${msg}`);
                      });
                  });
              } else if (error.request) {
                  console.error("No Response from Server:", error.request);
                  message.error("No response from server. Please check your internet connection.");
              } else {
                  console.error("Error Message:", error.message);
                  message.error("An unexpected error occurred.");
              }
          } finally {
              setLoading((prev) => ({ ...prev, delete: false }));
          }   
      };



  return (
    <BatchFormContext.Provider value={{ batchFormData, loading, setBatchFormData, errors, setErrors,  resetBatchForm, batchData, setBatchData, fetchBatches, handleDeleteBatch }}>
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
