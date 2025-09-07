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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});


    // Fucntion to reset form
    const resetTimeSlotForm = () => {
        setTimeSlotFormData(initialFormData);
    };

    // Fetch TimeSlot Data

    const fetchTimeSlotData = async () => {
        // if(!loading) return;

        setLoading(true);
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
            setLoading(false);
        }
    }

    return (
        <TimeSlotFormContext.Provider value={{timeSlotFormData, setTimeSlotFormData, loading, errors, setErrors, timeSlotData, setTimeSlotData, resetTimeSlotForm, fetchTimeSlotData}}>
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
