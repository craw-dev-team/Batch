import axios from "axios";
import { createContext, useContext, useState } from "react";
import BASE_URL from "../../../ip/Ip";


const SpecificTrainerContext = createContext();

const SpecificTrainerProvider = ({ children }) => {
    const [specificTrainer, setSpecificTrainer] = useState();
    const [loading, setLoading] = useState(false);


    const fetchSpecificTrainer = async (trainerId) => {
        if (loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };

        setLoading(true)

        try {
            const response = await axios.get(`${BASE_URL}/api/trainers/info/${trainerId}/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            const data = response?.data
            // console.log(data);
            
            setSpecificTrainer(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

        } catch (error) {
            console.error('Error fetching SpecificTrainer Data', error);
        } finally {
            setLoading(false)
        }
    };

    return (
            <SpecificTrainerContext.Provider value={{ specificTrainer, fetchSpecificTrainer }}>
                {children}
            </SpecificTrainerContext.Provider>
    )

};

const useSpecificTrainer = () => {
    const context = useContext(SpecificTrainerContext);
    if (!context) {
        throw new Error ('specific trainer must be used within a specific trainer provider')
    }
    return context;
}
export { SpecificTrainerProvider, useSpecificTrainer }