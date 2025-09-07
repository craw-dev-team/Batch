import React, { createContext, useState, useContext, useCallback } from "react";
import { message } from "antd";
import axiosInstance from "../api/api";


// Create the Context Object
const TicketsContext = createContext();

const TicketsProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [ticketData,setTicketData] = useState();
    const [ticketChat, setTicketChat] = useState();
  

    // FETCH DATA FROM SERVER OF ALL THE TICKETS RAISED BY THAT STUDENT
    const fetchTicketData = useCallback(async () => {
        if (loading) return; 
    
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/ticket/`);
            const data = response?.data;
           
            setTicketData(prevData => {
              if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
              }
              return prevData;
            });

        } catch (error) {
          console.error('Error fetching Ticket Data', error);
        } finally {
          setLoading(false);
        }
    }, [loading]);


    // Get Tickets Chats 
  const fetchChat = useCallback(async (id) => {
    if (!id) return;
  
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/ticket/chat/${id}/` );
      const data = response?.data;
      setTicketChat(prevData => JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData);
    } catch (error) {
      console.error('Error fetching Ticket Chat', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);


  // Post Request for send ticket messages
    const sendTicketMessage = async (ticketId, messageText) => {
  
      try {
        const response = await axiosInstance.post(`/api/ticket/message/${ticketId}/`,
          { message: messageText } );
  
        if (response.status === 200 || response.status === 201) {
          message.success("Message Sent.");
          fetchChat(ticketId);
        } else {
          message.error("Failed to send message.");
        }
      } catch (error) {
        // console.error("Error sending message:", error);
        message.error("Failed to send message.");
      }
    };



    const closeTicket = async (ticketId) => {
     try {
        const response = await axiosInstance.patch(`/api/ticket/status/${ticketId}/`,
          {status: "Closed"} );
  
        if (response.status === 200 || response.status === 201) {
          message.success("Ticket closed.");
          fetchChat(ticketId);
        } else {
          message.error("Failed to close ticket.");
        }
      } catch (error) {
        // console.error("Error sending message:", error);
        message.error("Failed to close ticket.");
      }
    };



    return (
      <TicketsContext.Provider value={{ loading, ticketData, setTicketData, fetchTicketData, fetchChat, ticketChat, sendTicketMessage, closeTicket  }}>
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
  