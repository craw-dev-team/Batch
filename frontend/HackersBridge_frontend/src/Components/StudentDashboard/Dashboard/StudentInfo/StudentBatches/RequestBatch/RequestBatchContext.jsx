import { createContext, useContext, useState } from "react";
import { useStudentBatch } from "../StudentBatchContext";
import { message } from "antd";
import axiosInstance from "../../../../../dashboard/api/api";



const RequestBatchContext = createContext();




const RequestBatchProvider = ({ children }) => {
    // store batch code 
    const [batchCode, setBatchCode] = useState("");
    // const [requestBatchData, setRequestBatchData] = useState();
    const [loading, setLoading] = useState(false);
    const { fetchStudentRecommendedBatches } = useStudentBatch();

  
    // HANDLE REQUEST OF STUDENT TO ADD IN A BATCH (STUDENT SEND BATCH CODE TO BACKEND)
    const handleRequestBatch = async (e) => {
        
        e.preventDefault();

        try {
            const response = await axiosInstance.post(`/Student_login/student_batch_request/`,
                { batch_code: batchCode } );

        if (response.status >= 200 && response.status <= 209) {
          message.success(response?.data?.message)
            onClose();
            setBatchCode('');
        } else {
          message.error(response?.data?.message)
        }

      } catch (error) {
          message.error(error?.response?.data?.message)
        }
    }; 


    // HANDLE REQUEST OF STUDENT BY BATCH ID TO ADD IN A BATCH (STUDENT SEND BATCH CODE TO BACKEND)
    const handleRequestBatchById = async (batchCode) => {
      
        try {
          setLoading(true);
          
          const response = await axiosInstance.post(`/Student_login/student_batch_request/`,
            { batch_code: batchCode } );

          if (response.status === 200 || response.status === 201) {
            
            message.success(response.data.message)

            fetchStudentRecommendedBatches();
          } else {
            message.error(response.data.error)

            console.error("Error in batch request:", response?.data);
          }

        } catch (error) {
          // console.error("Error sending batch ID to server", error);
          setLoading(false);
          return null; 
        }
      };
      

  
    return (
      <RequestBatchContext.Provider value={{  batchCode, setBatchCode, loading, setLoading, handleRequestBatch, handleRequestBatchById }}>
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