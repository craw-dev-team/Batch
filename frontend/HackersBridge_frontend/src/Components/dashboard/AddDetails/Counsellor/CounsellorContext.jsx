import React, { createContext, useState, useContext } from "react";
import axiosInstance from "../../api/api";
import { message } from "antd";

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    all: false,
    delete: false
  });

    // Function to reset form
    const resetCouncellorForm = () => {
        setCounsellorFormData(initialFormData);
    };

    const fetchCounsellors = async () => {
        if (loading.all) return;

        setLoading(prev => ({...prev, all: true }));
        try {
            const response = await axiosInstance.get(`/api/counsellors/`);
            const data = response?.data;
           
            setCounsellorData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

        } catch (error) {
          console.error('Error fetching Counsellor Data', error);
        } finally {
            setLoading( prev => ({...prev, all: false }) );
        }
    }


    // Delete Function 
    const handleDeleteCounsellor = async (counsellorId) => {
        if (!counsellorId) return;

        setLoading(prev => ({...prev, delete: true}));
        try {
            const response = await axiosInstance.delete(`/api/counsellors/delete/${counsellorId}/` );

            if (response.status >= 200 && response.status < 300) {
                message.success('counsellor Deleted Successfully');
                if (Array.isArray(counsellorData)) {
                    setCounsellorData(prevcounsellor => prevcounsellor.filter(counsellor => counsellor.id !== counsellorId));
                } else {
                    console.error('counsellordata is not an array');
                }
            }
        } catch (error) {
            console.error("Error deleting counsellor:", error);
        } finally {
            setLoading(prev => ({...prev, delete: false}));  
        }
    };

  return (
    <CounsellorFormContext.Provider value={{ counsellorFormData, setCounsellorFormData, loading, errors, setErrors,  resetCouncellorForm, counsellorData, setCounsellorData, fetchCounsellors, handleDeleteCounsellor }}>
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
