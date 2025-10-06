import React, { createContext, useState, useContext } from "react";
import axiosInstance from "../../api/api";
import { message } from "antd";

// Create the context object
const CoordinatorFormContext = createContext();


const initialFormData = {
    coordinatorId : "",
    coordinatorName: "",
    CoordinatorEmail: "",
    coordinatorNumber: "",
    coordinatorWeekOff: "",
}

const CoordinatorFormProvider = ({ children }) => {
  const [coordinatorFormData, setCoordinatorFormData] = useState(initialFormData);
  const [coordinatorData, setCoordinatorData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    all: false,
    delete: false
  });

    // Function to reset form
    const resetCoordinatorForm = () => {
        setCoordinatorFormData(initialFormData);
    };

    const fetchCoordinators = async () => {
        if (loading.all) return;

        setLoading(prev => ({...prev, all: true }));
        try {
            const response = await axiosInstance.get(`/api/coordinators/`);
            const data = response?.data;
           
            setCoordinatorData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

        } catch (error) {
            console.error('Error fetching Coordinator Data', error);
        } finally {
          setLoading(prev => ({...prev, all: false }) );
        }
    }


    // Delete Function 
    const handleDeleteCoordinator = async (coordinatorId) => {
      if (!coordinatorId) return;

      setLoading(prev => ({...prev, delete: true}));
      try {
          const response = await axiosInstance.delete(`/api/coordinators/delete/${coordinatorId}/`);

          if (response.status >= 200 && response.status < 300) {
                message.success('Coordinator Deleted Successfully');
              if (Array.isArray(coordinatorData)) {
                  setCoordinatorData(prevCoordinator => prevCoordinator.filter(coordinator => coordinator.id !== coordinatorId));
              } else {
                  console.error('coordinatordata is not an array');
              }
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
          setLoading(prev => ({...prev, delete: false}));  // Reset loading state after fetch
      }
    }; 
    

  return (
    <CoordinatorFormContext.Provider value={{ coordinatorFormData, setCoordinatorFormData, loading, errors, setErrors,  resetCoordinatorForm, coordinatorData, setCoordinatorData, fetchCoordinators, handleDeleteCoordinator }}>
      {children}
    </CoordinatorFormContext.Provider>
  );
};

// Custom hook to access context
const useCoordinatorForm = () => {
  const context = useContext(CoordinatorFormContext);
  if (!context) {
    throw new Error("useCoordinatorForm must be used within a CoordinatorFormProvider");
  }
  return context;
};

export { CoordinatorFormProvider, useCoordinatorForm }; // Named exports
