import axios from "axios";
import { createContext, useContext, useState } from "react";
import BASE_URL from "../../../ip/Ip";


const SpecificBatchContext = createContext();

const SpecificBatchProvider = ({ children }) => {
    const [specificBatch, setSpecificBatch] = useState();
    const [loading, setLoading] = useState(false);


    const fetchSpecificBatch = async (batchId) => {
        if (loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };
        
        setLoading(true)

        try {
            const response = await axios.get(`${BASE_URL}/api/batches/info/${batchId}/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );
            const data = response?.data
            // console.log(data);
            
            setSpecificBatch(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });
            // console.log(data);
            
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