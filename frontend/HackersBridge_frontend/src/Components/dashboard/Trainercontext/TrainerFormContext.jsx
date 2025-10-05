import { createContext, useContext, useState } from "react"
import axiosInstance from "../api/api";




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
    const [loading, setLoading] = useState(false);  // Loading state to manage fetch state
    const [errors, setErrors] = useState({});
    const [availableTrainersData, setAvailableTrainersData] = useState();

    // store trainer count for cards 
    const [trainersCount, setTrainersCount] = useState();

        // Function to reset form
        const resetTrainerForm = () => {
            setTrainerFormData(initialFormData);
        };
    
        const fetchTrainers = async () => {
            if (loading) return;  // Prevent multiple fetches at the same time

            setLoading(true);  // Set loading state
            try {
                const response = await axiosInstance.get(`/api/trainers/` );
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
                setLoading(false);  // Reset loading state after fetch
            }
        };

        
        // FETCH TRAINER COUNT TO DISPLAY IN CARDS
        const fetchTrainersCount = async (type = '') => {
            if (loading) return;
            
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/api/trainers/card/`, {
                     params: {
                        filter_by: type
                    }
                }
                );
                const data = response?.data;        
                
                setTrainersCount(prevData => 
                    JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
                );

            } catch (error) {
                console.error('Error fetching Batches Data', error);
            } finally {
                setLoading(false);
            }
        };

    
        return (
            <TrainerFormContext.Provider value={{ trainerFormData, loading, setTrainerFormData, errors, setErrors, resetTrainerForm, trainerData, setTrainerData, fetchTrainers, availableTrainersData, trainersCount, fetchTrainersCount }}>
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