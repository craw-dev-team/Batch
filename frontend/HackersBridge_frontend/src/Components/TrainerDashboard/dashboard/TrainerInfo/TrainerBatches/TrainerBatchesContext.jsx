import axios from "axios";
import { createContext, useState, useCallback, useContext } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../dashboard/api/api";

const TrainerBatchesContext = createContext();

const TrainerBatchProvider = ({children})=>{

    const [trainerBatches, setTrainerBatches] = useState();
    const [trainerBatchDetails, setTrainerBatchesDetails] = useState();
    const [loading, setLoading] = useState();

    // Fetch Trainer Batches
    const fetchTrainerBatches = useCallback(async()=>{

        if (loading) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/Trainer_login/trainer_batch/`);
            const data = response.data;
            // setUsername(data?.trainerinfo?.name)
            
            setTrainerBatches(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
            }
            return prevData;
            });

        } catch (error) {
            console.log('Error Fetching Trainer Batch Data', error);
        } finally{
            setLoading(false);
        }
    },[loading]);


    // fetch trainer batches info
    const fetchTrainerBatchesDetails = useCallback(async(id,date)=>{
        if(!id) return null;
        // if (loading) return;

        setLoading(true);
        try {
            const today = date || dayjs().format("YYYY-MM-DD");
            const response = await axiosInstance.get(`/Trainer_login/trainer/batch/info/${id}/?date=${today}`);
            const data = response.data;
            
            setTrainerBatchesDetails(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
            }
            return prevData;
            });

        } catch (error) {
            console.log('Error Fetching Trainer Batch Data', error);
        } finally{
            setLoading(false);
        }
    },[loading]);

    // Post Request for mark attendance
    const markAttendance = async (studentId,batchId,status,date)=>{
   
        try {
            const response = await axiosInstance.post(`/Trainer_login/trainer/mark-attendance/${studentId}/`,
                {
                    batch_id: batchId,
                    status: status,
                    date: date
                },
                {
                    headers: {"Content-Type":"application/json", "Authorization": `Bearer ${token}`},
                }
            );

            if (response.status === 200 || response.status === 201 ){
                message.success("Message Sent.");
                // fetchTrainerBatchesDetails(studentId);
            } else {
                message.error("Failed to send message.");
            }
        } catch (error) {
            message.error("Failed to send message.");
        }
    }


    return(
        <TrainerBatchesContext.Provider value={{trainerBatches, fetchTrainerBatches, fetchTrainerBatchesDetails, trainerBatchDetails, markAttendance, loading}}>
            {children}
        </TrainerBatchesContext.Provider>
    )
};

const useTrainerBatches = () => {
    const context = useContext(TrainerBatchesContext);
    if(!context){
        throw new Error("Use TrainerBatches must be used within a TrainerBatchesProvider");
    }
    return context;
};

export {TrainerBatchProvider, useTrainerBatches}