import React, { createContext, useContext, useCallback, useState } from "react";
import { message } from "antd";
import axiosInstance from "../api/api";

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
  const [trainer, setTrainer] = useState();
  const [loading, setLoading] = useState({
    all: false,
    delete: false,
    trainer: false
  });

  const resetAnnouncementForm = () => {
    setAnnouncement(initialFormData);
  };

  // Fetch announcements
  const fetchAnnouncement = useCallback(async () => {
    if (loading.all) return;

    setLoading(prev => ({...prev, all: true }));
    try {
      const response = await axiosInstance.get(`/api/announcement/`);

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
      setLoading(prev => ({...prev, all: false }) );
    }
  }, [loading]);


  // ✅ Create new announcement
  const handleFormSubmit = async (formData) => {
  
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
  };
  

  // ✅ Fetch trainer data
  const fetchTrainer = useCallback(async () => {
    if (loading.trainer) return;

    setLoading(prev => ({...prev, trainer: true }));
    try {
      const response = await axiosInstance.get(`/api/announcement/trainer/`);

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
      setLoading(prev => ({...prev, trainer: false }) );
    }
  }, [loading.trainer]);


  const handleDeleteAnnouncement = async (announcementId) => {
      if (!announcementId) return;

      setLoading(prev => ({...prev, delete: true}));
      try {
        const response = await axiosInstance.delete(`/api/announcement/delete/${announcementId}/`);
  
        if (response.status >= 200 && response.status <= 204) {
            message.success("Announcement deleted successfully");
          // setIsDeleted(true);
          fetchAnnouncement();
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        message.error("Failed to delete announcement");
      } finally {
          setLoading(prev => ({...prev, delete: false}) );
      }
    };



  return (
    <AnnouncementContext.Provider
      value={{loading, Announcement, setAnnouncement, fetchAnnouncement, handleFormSubmit, trainer, setTrainer, fetchTrainer, resetAnnouncementForm, handleDeleteAnnouncement }}
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
