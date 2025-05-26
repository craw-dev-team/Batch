import axios from "axios";
import React, { createContext, useState, useContext, useCallback } from "react";
import TicketRaiseForm from "./TicketRaiseForm";
import BASE_URL from "../../../../ip/Ip";
import { message } from "antd";


// Create the Context Object
const AllTicketsContext = createContext();

const AllTicketsProvider = ({ children }) => {
    const [allTickets, setAllTickets] = useState();
    const [loading, setLoading] = useState(false);
    const [ticketData,setTicketData] = useState();
  

    // FETCH DATA FROM SERVER OF ALL THE TICKETS RAISED BY THAT STUDENT
    const fetchTicketData = useCallback(async () => {
        if (loading) return; 
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/Student_login/student_ticket/`,
              { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
              withCredentials: true,
            }  
            );
            const data = response?.data;
            // console.log(data);

            setTicketData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

            // console.log('Batches Data ', data)
        } catch (error) {
          console.error('Error fetching Ticket Data', error);
        } finally {
          setLoading(false);
        }
    }, [loading]);



    // HANDLE TICKET SUBMIT AND SEND DATA TO SERVER  
    const handleFormSubmit = async (formData) => {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Unauthorized. Please log in.");
          return;
        }
      
        const payload = {
          issue_type: formData.issue,
          title: formData.subject,
          description: formData.description,
        };
      
        try {
          const response = await axios.post(`${BASE_URL}/Student_login/student_ticket_create/`,
            payload,
            { headers: {"Content-Type": "application/json", 'Authorization': `Bearer ${token}`}, }
          );

          if (response.status >= 200 && response.status <= 201) {
                message.success("Ticket submitted successfully.");
          } else {
                message.error("Failed to Raise Ticket")
          }
          
          fetchTicketData(); // Refresh ticket list after submit
        } catch (error) {
          console.error("Ticket submit error:", error);
          message.error("Failed to submit the form.");
        }
      };

    

   
  
    return (
      <AllTicketsContext.Provider value={{ loading, allTickets, setAllTickets, ticketData, setTicketData, handleFormSubmit, fetchTicketData }}>
        {children}
      </AllTicketsContext.Provider>
    );
  };
  
  // Custom hook to access context
  const useAllTickets = () => {
    const context = useContext(AllTicketsContext);
    if (!context) {
      throw new Error("useAllTickets must be used within a AllTicketsProvider");
    }
    return context;
  };
  
  export { AllTicketsProvider, useAllTickets }; // Named exports
  