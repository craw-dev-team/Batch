import axios from "axios";
import React, { createContext, useState, useContext } from "react";
import BASE_URL from "../../../../ip/Ip";

// Create the context object
const CounsellorFormContext = createContext();


const initialFormData = {
    counsellorId : "",
    counsellorName: "",
    CounsellorEmail: "",
    counsellorNumber: "",
    counsellorWeekOff: "",
}

const CounsellorFormProvider = ({ children }) => {
  const [counsellorFormData, setCounsellorFormData] = useState(initialFormData);
  const [counsellorData, setCounsellorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

    // Function to reset form
    const resetCouncellorForm = () => {
        setCounsellorFormData(initialFormData);
    };

    const fetchCounsellors = async () => {
        if (loading) return;
        
        // const token = localStorage.getItem('token');
        // if (!token) {
        //     console.error("No token found, user might be logged out.");
        //     return;
        // };

        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/counsellors/`, 
              { headers: { 'Content-Type': 'application/json'},
              withCredentials : true
            }
            );
            const data = response?.data;
          //  console.log(data);
           
            setCounsellorData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

            // console.log('Councellor Data ', data)
        } catch (error) {
          console.error('Error fetching Counsellor Data', error);
        } finally {
          setLoading(false);
        }
    }

  return (
    <CounsellorFormContext.Provider value={{ counsellorFormData, setCounsellorFormData, loading, errors, setErrors,  resetCouncellorForm, counsellorData, setCounsellorData, fetchCounsellors }}>
      {children}
    </CounsellorFormContext.Provider>
  );
};

// Custom hook to access context
const useCounsellorForm = () => {
  const context = useContext(CounsellorFormContext);
  if (!context) {
    throw new Error("useCounsellorForm must be used within a CounsellorFormProvider");
  }
  return context;
};

export { CounsellorFormProvider, useCounsellorForm }; // Named exports
