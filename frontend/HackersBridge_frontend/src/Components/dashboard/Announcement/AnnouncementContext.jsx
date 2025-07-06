import axios from "axios";
import React, { createContext, useContext, useCallback, useState } from "react";
import { message } from "antd";
import BASE_URL from "../../../ip/Ip";

// Create the Context Object
const AnnouncementContext = createContext();
const initialFormData = {
  Send_to : "",
  files: "",
  subject: "",
  text: ""
}

const AnnouncementProvider = ({ children }) => {
  const [Announcement, setAnnouncement] = useState();
  const [loading, setLoading] = useState(false);
  const [trainer, setTrainer] = useState();

  const resetAnnouncementForm = () => {
    setAnnouncement(initialFormData);
  };

  // Fetch announcements
  const fetchAnnouncement = useCallback(async () => {
    if (loading) return;

    // const token = localStorage.getItem("token");
    // if (!token) {
    //   console.error("No token found, user might be logged out.");
    //   return;
    // }

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/announcement/`, 
        { headers: { 'Content-Type': 'application/json'},
        withCredentials: true
      }
      );

      const data = response.data;
      setAnnouncement(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      console.error('Error fetching Announcement Data', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);


  // ✅ Create new announcement
  const handleFormSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Unauthorized. Please log in.");
      return;
    }
  
    // ✅ Extract only batch IDs from cascader paths
    const batchIds = formData.to.map(path => path[path.length - 1]);
  
    const Payload = new FormData();
    Payload.append("subject", formData.subject);
    Payload.append("text", formData.message);
  
    // ✅ Append each batch ID individually
    batchIds.forEach(id => {
      Payload.append("Send_to", id);
    });
  
    // ✅ Only append files if present
    if (formData.files && formData.files.length > 0) {
      formData.files.forEach(file => {
        Payload.append("file", file);
      });
    }
  
    console.log("Submitting Payload:", [...Payload.entries()]);
  
    
  };
  

  // ✅ Fetch trainer data
  const fetchTrainer = useCallback(async () => {
    if (loading) return;

    // const token = localStorage.getItem('token');
    // if (!token) {
    //   console.error("No token found, user might be logged out.");
    //   return;
    // }

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/announcement/trainer/`, 
        { headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
      );

      const data = response.data;
      setTrainer(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      console.error('Error fetching Trainer Data', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <AnnouncementContext.Provider
      value={{loading, Announcement, setAnnouncement, fetchAnnouncement, handleFormSubmit, trainer, setTrainer, fetchTrainer, resetAnnouncementForm}}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

// Custom hook to access context
const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error("useAnnouncement must be used within an AnnouncementProvider");
  }
  return context;
};

export { AnnouncementProvider, useAnnouncement };
