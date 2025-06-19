import axios from "axios";
import React, { createContext, useState, useContext, useCallback } from "react";
// import TicketRaiseForm from "./TicketRaiseForm";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";


// Create the Context Object
const TicketsContext = createContext();

const TicketsProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [ticketData,setTicketData] = useState();
    const [ticketChat, setTicketChat] = useState();
  

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

            // console.log( data)
        } catch (error) {
          console.error('Error fetching Ticket Data', error);
        } finally {
          setLoading(false);
        }
    }, [loading]);


    // Get Tickets Chats 
  const fetchChat = useCallback(async (id) => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/ticket/chat/${id}/`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        withCredentials: true,
      });
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
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Unauthorized. Please log in.");
        return;
      }
  
      try {
        const response = await axios.post(`${BASE_URL}/api/ticket/message/${ticketId}/`,
          { message: messageText },
          { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            withCredentials: true,
          }
        );
  
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

    return (
      <TicketsContext.Provider value={{ loading, ticketData, setTicketData, fetchTicketData, fetchChat, ticketChat, sendTicketMessage  }}>
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
  