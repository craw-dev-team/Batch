import { createContext, useContext, useState } from "react"
import axiosInstance from "../api/api";
import { message } from "antd";




const TrainerFormContext = createContext();

const initialFormData = {
    trainerId : "",
    trainerName : "",
    trainerDateOfJoining : "",
    trainerPhoneNumber : "",
    trainerEmailAddress : "",
    trainerExperience : [],
    trainerCourse : "",
    trainerMode : "",
    preferredWeek : "",
    trainerLanguage : "",
    trainerPreferredWeek : "",
    trainerTeamLeader : "",
    trainerCoordinator : "",
    location : "",
    trainerWeekOff : "",
    isTeamLeader : true,

};


const TrainerFormProvider = ({ children }) => {
    
    const [trainerFormData, setTrainerFormData] = useState(initialFormData);
    const [trainerData, setTrainerData] = useState([]);
    const [errors, setErrors] = useState({});
    const [availableTrainersData, setAvailableTrainersData] = useState();
    // store trainer count for cards 
    const [trainersCount, setTrainersCount] = useState();
    const [trainersList, setTrainersList] = useState();
    const [loading, setLoading] = useState({
        all: false,
        available: false,
        count: false,
        trainerList: false,
        delete: false
    });

        // Function to reset form
        const resetTrainerForm = () => {
            setTrainerFormData(initialFormData);
        };
    
        // fetch all trainers 
        const fetchTrainers = async () => {
            if (loading.all) return;  // Prevent multiple fetches at the same time

            setLoading(prev => ({...prev, all: true}));  // Set loading state
            try {
                const response = await axiosInstance.get(`/api/trainers/`);
                const trainers = response?.data;

                const available = await axiosInstance.get(`/api/trainers/availability/`);
                const availableTrainer = available?.data;
                
                // Update trainerData state only if data has changed
                setTrainerData((prevData) => {
                
                    return JSON.stringify(prevData) !== JSON.stringify(trainers) ? trainers : prevData;
                });

                 // Update availbale trainer state only if data has changed
                setAvailableTrainersData((prevData) => {
                
                    return JSON.stringify(prevData) !== JSON.stringify(availableTrainer) ? availableTrainer : prevData;
                });
    
            } catch (error) {
                console.error('Error fetching Trainer Data', error);
            } finally {
                setLoading(prev => ({...prev, all: false}));  // Reset loading state after fetch
            }
        };

        // fetch available trainers 
         const fetchAvailableTrainers = async () => {
            if (loading.available) return;  // Prevent multiple fetches at the same time

            setLoading(prev => ({...prev, available: true}));  // Set loading state
            try {

                const available = await axiosInstance.get(`/api/trainers/availability/`);
                const availableTrainer = available?.data;

                 // Update availbale trainer state only if data has changed
                setAvailableTrainersData((prevData) => {
                
                    return JSON.stringify(prevData) !== JSON.stringify(availableTrainer) ? availableTrainer : prevData;
                });
    
            } catch (error) {
                console.error('Error fetching Available Trainer Data', error);
            } finally {
                setLoading(prev => ({...prev, all: false}));  // Reset loading state after fetch
            }
        };

        
        // fetch only student count for cards 
        const fetchTrainerCount = async () => {
            if (loading.count) return;
            
            setLoading(prev => ({ ...prev, count: false }));
            try {
                const response = await axiosInstance.get(`/api/trainersdata/summary/`, {
                } );
                
                const data = response?.data;                                            
                setTrainersCount(data);

            } catch (error) {
            console.error('Error fetching Batches Data', error);
            } finally {
                setLoading(prev => ({ ...prev, count: false }));
            }
        };


        // FETCH TRAINER COUNT TO DISPLAY IN LIST WHEN CARD CLICKED
        const fetchTrainerList = async (type = '', page = 1, pageSize, search = '') => {
            if (loading.trainerList) return;
            
            setLoading(prev => ({...prev, trainerList: true}));
       
            try {
                const response = await axiosInstance.get(`/api/trainersdata/list/`, {
                     params: {
                        filter_by: type,
                        page,
                        page_size: pageSize,
                        search
                    }
                }
                );
                const data = response?.data;                        
                console.log(data);
                
                setTrainersList(prevData => 
                    JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
                );

            } catch (error) {
                console.error('Error fetching Batches Data', error);
            } finally {
                setLoading(prev => ({...prev, trainerList: false}) ); 
            }
        };

    
        // delete trainer 
        const handleDeleteTrainer = async (trainerId) => {
            if (!trainerId) return;
                
            try {
                const response = await axiosInstance.delete(`/api/trainers/delete/${trainerId}/`);

                if (response.status >= 200 && response.status <= 204) {
                    message.success('Trainer Deleted Successfully');
                    try {
                        await fetchTrainers();

                    } catch (fetchError) {
                        console.error("Fetch error:", fetchError);
                    }
                }
            } catch (error) {
                setLoading(prev => ({...prev, delete: false}));
            
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
            }       
        };



        return (
            <TrainerFormContext.Provider value={{ trainerFormData, loading, setTrainerFormData, errors, setErrors, resetTrainerForm, trainerData, setTrainerData, fetchTrainers, fetchTrainerCount, fetchTrainerList,  fetchAvailableTrainers,  availableTrainersData, trainersCount, trainersList, handleDeleteTrainer }}>
                {children}
            </TrainerFormContext.Provider>
        );
};

const useTrainerForm = () => {
    const context = useContext(TrainerFormContext);
    if(!context) {
        throw new Error("UseTrainerForm must be used within a TrainerFormProvider");
    }
    return context;
};

export { TrainerFormProvider , useTrainerForm };