import React, { createContext, useState, useContext, useCallback } from "react";
import { message } from "antd";
import axiosInstance from "../../../dashboard/api/api";

const AllTicketsContext = createContext();

const AllTicketsProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState();
  const [ticketChat, setTicketChat] = useState();

  // Get Tickets Data 
  const fetchTicketData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/Student_login/student_ticket/`);
      const data = response?.data;      
      setTicketData(prevData => JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData);
    } catch (error) {
      console.error('Error fetching Ticket Data', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);


// Get Tickets Chats 
  const fetchTicketChat = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/Student_login/student_ticket/chats/${id}/` );
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
      const response = await axiosInstance.post(`/Student_login/student_ticket/chats/message/${ticketId}/`,
        { message: messageText } );

      if (response.status === 200 || response.status === 201) {
        message.success("Message sent ");
        fetchTicketChat(ticketId);
      } else {
        message.error("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message.");
    }
  };

  // Post Request for Ticket Submission
  const handleFormSubmit = async (formData, recaptchaToken) => {

    const payload = {
      issue_type: formData.issue_type,
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      recaptcha_token: recaptchaToken
    };

    try {
      const response = await axiosInstance.post(`/Student_login/student_ticket_create/`, payload );

      if (response.status >= 200 && response.status <= 201) {
        message.success("Ticket Raised Successfully.");
      } else {
        message.error("Failed to Raise Ticket");
      }

      fetchTicketData();
    } catch (error) {
      console.error("Ticket submit error:", error);
      message.error("Failed to submit the form.");
    }
  };


  // Close Ticket Post Request API
  const handleCloseTicket = async (ticketId)=>{
    if(!ticketId) return;

    try {
      const response = await axiosInstance.post(`/Student_login/student_ticket/status/${ticketId}/`,null, {
        headers: { "Content-Type": "application/json"},
        withCredentials : true
      });
      
      if (response.status >= 200 && response.status <= 204) {
        message.success("Ticket Closed !");
        fetchTicketData();

      }

    } catch (error) {
      console.error("Error Closing Ticket:", error);
      message.error("Failed to Close Ticket");
    }
  }


  return (
    <AllTicketsContext.Provider
      value={{
        loading,
        ticketData,
        setTicketData,
        handleFormSubmit,
        fetchTicketData,
        fetchTicketChat,
        ticketChat,
        setTicketChat,
        sendTicketMessage,
        handleCloseTicket
      }}
    >
      {children}
    </AllTicketsContext.Provider>
  );
};

const useAllTickets = () => {
  const context = useContext(AllTicketsContext);
  if (!context) throw new Error("useAllTickets must be used within a AllTicketsProvider ////");
  return context;
};

export { AllTicketsProvider, useAllTickets };
