import axios from "axios";
import React, { createContext, useState, useContext } from "react";
import BASE_URL from "../../../../ip/Ip";

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

    // Function to reset form
    const resetCoordinatorForm = () => {
        setCoordinatorFormData(initialFormData);
    };

    const fetchCoordinators = async () => {
        if (loading) return;
        
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };
        
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/coordinators/`, 
              { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              withCredentials : true
            }
            );
            const data = response?.data;
           
            setCoordinatorData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

            // console.log('Coordinator Data ', data)
        } catch (error) {
          console.error('Error fetching Coordinator Data', error);
        } finally {
          setLoading(false);
        }
    }

  return (
    <CoordinatorFormContext.Provider value={{ coordinatorFormData, setCoordinatorFormData, loading, errors, setErrors,  resetCoordinatorForm, coordinatorData, setCoordinatorData, fetchCoordinators }}>
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
