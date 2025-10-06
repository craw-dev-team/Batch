import React,{useState,useEffect,createContext,useContext} from "react";
import { message } from "antd";
import axiosInstance from "../../api/api";


const TimeSlotFormContext = createContext();


const initialFormData = {
    id : "",
    startTime : "",
    endTime : "",
    weekType : undefined,
    specialTimeSlot : undefined
}

const TimeSlotProvider = ({children}) => {
    const [timeSlotFormData, setTimeSlotFormData] = useState(initialFormData);
    const [timeSlotData, setTimeSlotData] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState({
        all: false,
        delete: false
    });


    // Fucntion to reset form
    const resetTimeSlotForm = () => {
        setTimeSlotFormData(initialFormData);
    };

    // Fetch TimeSlot Data
    const fetchTimeSlotData = async () => {
        if(loading.all) return;

        setLoading(prev => ({...prev, all: true}));
        try {
            const response = await axiosInstance.get(`/api/timeslots/`);
            const data = response?.data;

        setTimeSlotData(data)
        //     if(JSON.stringify(prevData)!== JSON.stringify(data)){
        //         return data;
        //     }
        //     return prevData;
        // });

        } catch (error) {
            message.error('Error Fetching TiemSlot Data',error);
        }finally{
            setLoading(prev => ({...prev, all: false}) );
        }
    }


        // Delete Function 
        const handleDeleteTimeSlot = async (timeSlotId) => {
            if (!timeSlotId) return;

            setLoading(prev => ({...prev, delete: true}));
            try {
                const response = await axiosInstance.delete(`/api/timeslots/delete/${timeSlotId}/`);
        
                if (response.status === 204 || response.status === 200) {
                    message.success('TimeSlot Deleted Successfully');
                    
                }
            } catch (error) {
                if (error.response) {
                    message.error("Delete failed: " + (error.response.data?.detail || "Server error"));
                    console.error("Server Error Response:", error.response.data);
                } else if (error.request) {
                    message.error("No response from server.");
                } else {
                    message.error("Unexpected error occurred.");
                }
            } finally {
                setLoading(prev => ({...prev, delete: false}));
            }
        };

    return (
        <TimeSlotFormContext.Provider value={{timeSlotFormData, setTimeSlotFormData, loading, errors, setErrors, timeSlotData, setTimeSlotData, resetTimeSlotForm, fetchTimeSlotData, handleDeleteTimeSlot }}>
            {children}
        </TimeSlotFormContext.Provider>
    )

};

// Custom hook to access context
const useTimeSlotForm = () => {
    const context = useContext(TimeSlotFormContext);
    if (!context) {
        throw new Error("useTimeSlotForm must be used within a TimeSlotProvider");
    }
    return context;
};

export { TimeSlotProvider, useTimeSlotForm};
