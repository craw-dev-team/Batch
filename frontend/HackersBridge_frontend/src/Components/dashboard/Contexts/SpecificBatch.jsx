import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/api";


const SpecificBatchContext = createContext();

const SpecificBatchProvider = ({ children }) => {
    const [specificBatch, setSpecificBatch] = useState();
    const [loading, setLoading] = useState(false);


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

    return (
            <SpecificBatchContext.Provider value={{ specificBatch, fetchSpecificBatch }}>
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