import React, { createContext, useContext, useState, useCallback } from "react";
import { message } from "antd";
import { useSpecificStudent } from "../Contexts/SpecificStudent";
import axiosInstance from "../api/api";




const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};



const TagContext = createContext();

const TagProvider = ({ children }) => {
  const [tagData, setTagData] = useState([]);
  const {fetchSpecificStudent} = useSpecificStudent();
  const [loading, setLoading] = useState(false);

  
  // Fetch All Tags
  const fetchTagData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/tags/` );

      const data = response.data;

      setTagData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
          return data;
        }
        return prevData;
      });
    } catch (error) {
      console.error("Error fetching tag data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);


  // Handle Tag form submit (POST)
  const handleTagSubmit = async (formData ) => {
  
    const payload = {
      tag_name: formData.name, 
      tag_description: formData.description,
      tag_color: getRandomColor(),
    };
  
    try {
      const response = await axiosInstance.post(`/api/tags/create/`, payload );
  
      if (response.status === 201 || response.status === 200) {
        message.success("Tag created successfully!");
        fetchTagData(); // optionally refresh tags
      } else {
        message.error("Failed to create tag.");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };
  

  // Tag Delete
  const deleteTag = async (tagId) => {
  
    try {
      const response = await axiosInstance.delete(`/api/tags/delete/${tagId}/` );
  
      if (response.status === 204 || response.status === 200) {
        message.success("Tag deleted successfully!");
        fetchTagData(); // Refresh the list
      } else {
        message.error("Failed to delete tag.");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  // Handle Tag Remove (POST)
  const handleRemoveTag = async (tagIds, studentId) => {
    if (!studentId || !tagIds?.length) return;
  
    const payload = {
      tag_ids: tagIds,
      action: "unassign"
    };
    
    try {
      const response = await axiosInstance.post(`/api/student/assign_tag/${studentId}/`, payload );
  
      if (response.status === 200 || response.status === 201) {
        message.success("Tag removed!");
        fetchSpecificStudent(studentId);
      } else {
        message.error("Failed to remove tags.");
      } 
    } catch (error) {
      console.error("Error remove tags:", error);
    }
  };

  return (
    <TagContext.Provider value={{ tagData, setTagData, loading, handleTagSubmit, fetchTagData, deleteTag, handleRemoveTag }}>
      {children}
    </TagContext.Provider>
  );
};

const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider");
  }
  return context;
};

export { TagProvider, useTagContext };
