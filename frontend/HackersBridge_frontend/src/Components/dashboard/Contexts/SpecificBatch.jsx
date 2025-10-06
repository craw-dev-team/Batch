import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/api";
import { message } from "antd";


const SpecificBatchContext = createContext();

const SpecificBatchProvider = ({ children }) => {
    const [specificBatch, setSpecificBatch] = useState();
    const [loading, setLoading] = useState(false);
    // store the batch class link in input field 
    const [classLink, setClassLink] = useState('');

    const fetchSpecificBatch = async (batchId) => {
        if (loading) return;
        
        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/batches/info/${batchId}/` );
            const data = response?.data
            
            setSpecificBatch(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });
            
        } catch (error) {
            console.error('Error fetching SpecificBatch Data', error);
        } finally {
            setLoading(false)
        }
    };


    // send the batch class link to the server 
    const handleSaveClassLink = async (batch_id, classLink) => {  
        console.log(batch_id, classLink);
        
        try {
            const response = await axiosInstance.patch(`/api/batch-link/${batch_id}/`,
                {batch_link: classLink } );

            if (response.status === 200) {     
                message.success("Class Link Added")
                return response.data;

            } else {
                message.error("Error issuing certificate", response?.error.message)
            };
        } catch (error) {
            message.error(error?.response?.data?.message);
        
        }
    };




    return (
            <SpecificBatchContext.Provider value={{ specificBatch, fetchSpecificBatch,classLink, setClassLink, handleSaveClassLink }}>
                {children}
            </SpecificBatchContext.Provider>
    )

};

const useSpecificBatch = () => {
    const context = useContext(SpecificBatchContext);
    if (!context) {
        throw new Error ('specific batch must be used within a specific batch provider')
    }
    return context;
}
export { SpecificBatchProvider, useSpecificBatch }