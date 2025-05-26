import axios from "axios";
import { createContext, useContext, useState } from "react";
import BASE_URL from "../../../../../../ip/Ip";
import { useStudentBatch } from "../StudentBatchContext";
import { message } from "antd";



const RequestBatchContext = createContext();




const RequestBatchProvider = ({ children }) => {
    // store batch code 
    const [batchCode, setBatchCode] = useState("");
    const [requestBatchData, setRequestBatchData] = useState();
    const [loading, setLoading] = useState(false);
    const { fetchStudentRecommendedBatches } = useStudentBatch();

  
    // HANDLE REQUEST OF STUDENT TO ADD IN A BATCH (STUDENT SEND BATCH CODE TO BACKEND)
    const handleRequestBatch = async (e) => {
        
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };

        try {
            const response = await axios.post(`${BASE_URL}/Student_login/student_batch_request/`,
                { batch_code: batchCode },
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials: true,
            },
        );
        setRequestBatchData(response.data)
        console.log(response);
        
        } catch (error) {
          message.error(error?.response?.data?.message)
        console.log("Error sending code to server", error);
        }
    }; 


    // HANDLE REQUEST OF STUDENT BY BATCH ID TO ADD IN A BATCH (STUDENT SEND BATCH CODE TO BACKEND)
    const handleRequestBatchById = async (batchCode) => {
        
        const token = localStorage.getItem("token");
        if (!token) {
          // console.error("No token found, user might be logged out.");
          return;
        }
      
        try {
          setLoading(true);
          
          const response = await axios.post(`${BASE_URL}/Student_login/student_batch_request/`,
            { batch_code: batchCode },  // Assuming your backend expects `batch_id`
            { headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
              withCredentials: true,
            }
          );

          if (response.status === 200 || response.status === 201) {
            
            message.success(response.data.message)

            fetchStudentRecommendedBatches();
          } else {
            message.error(response.data.message)

            console.error("Error in batch request:", response);
          }

          // console.log("Batch ID request success:", response);
        } catch (error) {
          // console.error("Error sending batch ID to server", error);
          setLoading(false);
          return null; 
        }
      };
      

  
    return (
      <RequestBatchContext.Provider value={{  batchCode, setBatchCode, loading, setLoading, handleRequestBatch, requestBatchData, handleRequestBatchById }}>
        {children}
      </RequestBatchContext.Provider>
    );
  };



const useRequestBatch = () => {
    const context = useContext(RequestBatchContext);
    if (!context) {
        throw new Error("useRequestBatch must be used within a RequestBatchProvider")
    }
    return context;
}

export { RequestBatchProvider, useRequestBatch }