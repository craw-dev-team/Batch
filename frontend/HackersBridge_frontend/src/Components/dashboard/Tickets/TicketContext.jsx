import axios from "axios";
import React, { createContext, useState, useContext, useCallback } from "react";
// import TicketRaiseForm from "./TicketRaiseForm";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";


// Create the Context Object
const TicketsContext = createContext();

const TicketsProvider = ({ children }) => {
    const [tickets, setTickets] = useState();
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
            const response = await axios.get(`${BASE_URL}/api/ticket/`,
              { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
              withCredentials: true,
            }  
            );
            const data = response?.data;
            console.log(data);
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


    return (
      <TicketsContext.Provider value={{ loading, tickets, setTickets, ticketData, setTicketData, fetchTicketData }}>
        {children}
      </TicketsContext.Provider>
    );
  };
  
  // Custom hook to access context
  const useTickets = () => {
    const context = useContext(TicketsContext);
    if (!context) {
      throw new Error("useTickets must be used within a TicketsProvider");
    }
    return context;
  };
  
  export { TicketsProvider, useTickets }; // Named exports
  