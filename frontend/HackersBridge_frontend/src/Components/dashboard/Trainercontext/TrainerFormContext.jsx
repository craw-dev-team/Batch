import { createContext, useContext, useState } from "react"
import axios from "axios";
import BASE_URL from "../../../ip/Ip";



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
     const [availableTrainers, setAvailableTrainers] = useState();

        // Function to reset form
        const resetTrainerForm = () => {
            setTrainerFormData(initialFormData);
        };
    
        const fetchTrainers = async () => {
            if (loading) return;  // Prevent multiple fetches at the same time
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found, user might be logged out.");
                return;
            };

            setLoading(true);  // Set loading state
            try {
                const response = await axios.get(`${BASE_URL}/api/trainers/`, 
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                    withCredentials : true
                }
                );
                const trainers = response?.data;
                const available = await axios.get(`${BASE_URL}/api/trainers/availability/`, 
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                    withCredentials : true
                }
                );
                const availableTrainer = available?.data;
                // console.log(availableTrainer);
                
                // Update trainerData state only if data has changed
                setTrainerData((prevData) => {
                
                    return JSON.stringify(prevData) !== JSON.stringify(trainers) ? trainers : prevData;
                });

                 // Update availbale trainer state only if data has changed
                setAvailableTrainers((prevData) => {
                
                    return JSON.stringify(prevData) !== JSON.stringify(availableTrainer) ? availableTrainer : prevData;
                });
    
                // console.log('Trainer Data Updated:', trainers); // Log new data here
            } catch (error) {
                console.error('Error fetching Trainer Data', error);
            } finally {
                setLoading(false);  // Reset loading state after fetch
            }
        };
    
        return (
            <TrainerFormContext.Provider value={{ trainerFormData, loading, setTrainerFormData, errors, setErrors, resetTrainerForm, trainerData, setTrainerData, fetchTrainers, availableTrainers }}>
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