import axios from "axios";
import BASE_URL from "../../ip/Ip";
import { message } from "antd";



const useBatchStatusChange = () => {

    const handleBatchStatusChange = async ({batchId, status}) => {
        if (!batchId || !status) return;

            // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split("T")[0];
        
            // If status is "Completed" or "Cancelled", set batch_end_date to today
            const updatedData = {
                status,
                ...(status === "Completed" || status === "Cancelled" ? { end_date: today } : {}),
            };
                
        try {
            const response = await axios.put(`${BASE_URL}/api/batches/edit/${batchId}/`,
                updatedData,
                { headers: { 'Content-Type': 'application/json' },
                withCredentials : true
            }
            );
            
            if (response.status >= 200 && response.status < 300) {
                message.success(`Batch status updated successfully to ${status} !`);
                
            } else {
                message.error("Batch status not updated.");
            };
            
           
    
        } catch (error) {
            console.error("Error sending status data to server", error);
        }
    };
    return {handleBatchStatusChange};
}

export default useBatchStatusChange;