import axios from "axios";
import { createContext, useContext, useState } from "react";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";


const SpecificTrainerContext = createContext();

const SpecificTrainerProvider = ({ children }) => {
    const [specificTrainer, setSpecificTrainer] = useState();
    const [loading, setLoading] = useState(false);

    // for status change of tainer 
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOption, setSelectedOption] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);



    // fetch specific trainer details
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
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
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


    // change trainer status based on leave 
    const handleTrainerStatusChange = async (trainerId) => {
      if (loading) return;
    
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user might be logged out.");
        return;
      }
    
      
      try {
        setLoading(true);
        let apiUrl = "";
        let payload = {};
    
        if (selectedOption === "custom" && startDate && endDate) {
          // Send to custom date API
          apiUrl = `${BASE_URL}/api/trainers/leave_long_mail/${trainerId}/`;
          payload = {
            trainer_id: specificTrainer?.Trainer_All?.trainer?.id,
            start_date: startDate,
            end_date: endDate,
            leave_status: selectedOption
          };
        } else {
          // Send to regular leave status API
          apiUrl = `${BASE_URL}/api/trainers/leave_mail/${trainerId}/`;
          payload = {
            trainer_id: specificTrainer?.Trainer_All?.trainer?.id,
            leave_status: selectedOption,
          };
        }
    
        const response = await axios.post(apiUrl, payload, {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          withCredentials : true
        }
        );
        // console.log(response);
        
    
        if (response.status === 200) {
          message.success("All done! Trainer leave updated and email sent");
          setIsEditing(false);
        } else {
          message.error("Issue in Updating Trainer Leave Status");
        }
      } catch (error) {
        console.error("API Error:", error);
        message.error(
          error.response?.data?.message || "An error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    

    return (
            <SpecificTrainerContext.Provider value={{ specificTrainer, fetchSpecificTrainer, loading,  isEditing, setIsEditing, selectedOption, setSelectedOption,
                startDate, setStartDate, endDate, setEndDate,  handleTrainerStatusChange }}>
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