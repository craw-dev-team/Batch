import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import axiosInstance from "../api/api";

// Create the context object
const AllLogsContext = createContext();


const AllLogsProvider = ({ children }) => {
  const [allLogsData, setAllLogsData] = useState();
  const [loading, setLoading] = useState(false);


    const fetchAllLogs = useCallback (async ({ page = 1, pageSize = 100, search = '' } = {}) => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/logs/`,
            {
            params: {
              page,
              page_size: pageSize,
              search,
            },
          }
          );
            const data = response.data;
            
            setAllLogsData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              };
              return prevData;
            });

        } catch (error) {
          console.error('Error fetching All Logs Data', error);
        } finally {
          setLoading(false);
        }
    }, [loading]);


  return (
    <AllLogsContext.Provider value={{ loading, allLogsData, setAllLogsData, fetchAllLogs }}>
      {children}
    </AllLogsContext.Provider>
  );
};

// Custom hook to access context
const useAllLogs = () => {
  const context = useContext(AllLogsContext);
  if (!context) {
    throw new Error("All Logs must be used within a AllLogsProvider");
  }
  return context;
};

export { AllLogsProvider, useAllLogs }; // Named exports
