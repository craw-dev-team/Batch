import axios from "axios";
import { createContext, useState, useCallback, useContext } from "react";
import axiosInstance from "../../../../dashboard/api/api";

const TrainerInfoContext = createContext();


const TrainerInfoProvider = ({ children })=>{

    const [trainerDetails, setTrainerDetails] = useState();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState();
   

    // Fetch Trainer Details
    const fetchTrainerDetails = useCallback(async()=>{
        if (loading) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/Trainer_login/trainer_info/`);
            const data = response.data;
            setUsername(data?.trainerinfo?.name);
            console.log(data);
            
            setTrainerDetails(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
            }
            return prevData;
            });

            // console.log('Batches Data ', data)
        } catch (error) {
            console.log('Error Fetching Trainer Data', error);
        } finally{
            setLoading(false);
        }
    },[loading]);



    return (
        <TrainerInfoContext.Provider value={{ trainerDetails, fetchTrainerDetails, loading }}>
            {children}
        </TrainerInfoContext.Provider>
    )
};

    const useTrainerInfo = () => {
        const context = useContext(TrainerInfoContext);
        if(!context){
            throw new Error("UseTrainerInfo must be used within a TrainerInfoProvider");
        }
        return context;
    };

    export { TrainerInfoProvider, useTrainerInfo };

