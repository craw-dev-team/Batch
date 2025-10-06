// import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
// import axiosInstance from "../api/api";
// import { message } from "antd";
// import axios from "axios";
// import BASE_URL from "../../../ip/Ip";
// import GlobalNotification from "./NotificationForeGroundPopup";



// const NotificationContext = createContext({});

// const NotificationProvider = ({children}) => {
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState([]);

//   // API to publish campaign
//   const publishCampaign = useCallback(async (formPayload = {}) => {
//   try {
//     setLoading(true);
//     const { data } = await axios.post(
//       `${BASE_URL}/push_notification/notification/create/`,
//       formPayload,
//       { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
//     );

//     // Show popup immediately after publish
//     // GlobalNotification.show("New Notification", formPayload.title || "Your campaign has been published!");
//     GlobalNotification.show(
//       data?.title || "New Notification",
//       data?.description || "Your campaign has been published!"
//     );
//     // console.log(data)



//     message.success("Campaign published successfully!");
//     fetchNotification(); // Refresh the list

//     return data;
//   } catch (error) {
//     console.error("Error publishing campaign:", error);
//     message.error("Failed to publish campaign");
//     throw error;
//   } finally {
//     setLoading(false);
//   }
// }, []);


// // API to reschedule notification
// const rescheduleNotification = useCallback(async (id, payload = {}) => {
//   try {
//     setLoading(true);

//     const { data } = await axios.post(
//       `${BASE_URL}/push_notification/notification/${id}/reschedule/`,
//       payload,
//       { headers: { "Content-Type": "application/json" }, withCredentials: true }
//     );

//     message.success("Notification rescheduled successfully!");
//     fetchNotification(); // refresh list after rescheduling

//     return data;
//   } catch (error) {
//     console.error("Error rescheduling notification:", error);
//     message.error("Failed to reschedule notification");
//     throw error;
//   } finally {
//     setLoading(false);
//   }
// }, [fetchNotification]);




//   // Fetch Notifications
//   const fetchNotification = useCallback(async() => {
//     if (loading) return;

//     setLoading(true);
//     try {
//       const response = await axiosInstance.get(`/push_notification/notifications/`);
//       const data = response?.data;
//       console.log(data);

//       // setNotification(prevData => {
//       //   if(JSON.stringify(prevData) !== JSON.stringify(data)) {
//       //     return data;
//       //   }
//       //   return prevData;
//       // });

//       setNotification(prevData => {
//   const safeData = Array.isArray(data) ? data : data?.results || [];
//   if (JSON.stringify(prevData) !== JSON.stringify(safeData)) {
//     return safeData;
//   }
//   return prevData;
// });



//     } catch (error) {
//       console.log('Error Fetching Notification List', error);
//       message.error("Failed to fetch notifications");
//     } finally {
//       setLoading(false);
//     }
//   }, [loading]);

//   return (
//     <NotificationContext.Provider value={{ 
//       publishCampaign, 
//       loading, 
//       fetchNotification, 
//       rescheduleNotification,
//       setNotification, 
//       notification 
//     }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// const useNotification = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error("useNotification must be used within a NotificationProvider");
//   }
//   return context;
// };

// export { NotificationProvider, useNotification };

// import React, { createContext, useContext, useCallback, useState } from "react";
// import axiosInstance from "../api/api";
// import { message } from "antd";
// import axios from "axios";
// import BASE_URL from "../../../ip/Ip";
// import GlobalNotification from "./NotificationForeGroundPopup";

// const NotificationContext = createContext({});

// const NotificationProvider = ({ children }) => {
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState([]);

//   // 1️⃣ Fetch Notifications
//   const fetchNotification = useCallback(async () => {
//     if (loading) return;

//     setLoading(true);
//     try {
//       const response = await axiosInstance.get(`/push_notification/notifications/`);
//       const data = response?.data;

//       const safeData = Array.isArray(data) ? data : data?.results || [];
//       if (JSON.stringify(notification) !== JSON.stringify(safeData)) {
//         setNotification(safeData);
//       }
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//       message.error("Failed to fetch notifications");
//     } finally {
//       setLoading(false);
//     }
//   }, [loading, notification]);

//   // 2️⃣ Publish campaign
//   const publishCampaign = useCallback(
//     async (formPayload = {}) => {
//       try {
//         setLoading(true);

//         const { data } = await axios.post(
//           `${BASE_URL}/push_notification/notification/create/`,
//           formPayload,
//           { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
//         );

//         // Show popup immediately
//         GlobalNotification.show(
//           data?.title || "New Notification",
//           data?.description || "Your campaign has been published!",
//           data?.link || null
//         );

//         message.success("Campaign published successfully!");
//         await fetchNotification(); // Refresh the list

//         return data;
//       } catch (error) {
//         console.error("Error publishing campaign:", error);
//         message.error("Failed to publish campaign");
//         throw error;
//       } finally {
//         setLoading(false);
//       }
//     },
//     [fetchNotification]
//   );

//   // 3️⃣ Reschedule notification
//   // const rescheduleNotification = useCallback(
//   //   async (id, payload = {}) => {
//   //     try {
//   //       setLoading(true);

//   //       const { data } = await axios.post(
//   //         `${BASE_URL}/push_notification/notification/${id}/reschedule/`,
//   //         payload,
//   //         { headers: { "Content-Type": "application/json" }, withCredentials: true }
//   //       );

//   //       message.success("Notification rescheduled successfully!");
//   //       await fetchNotification(); // Refresh list after rescheduling

//   //       return data;
//   //     } catch (error) {
//   //       console.error("Error rescheduling notification:", error);
//   //       message.error("Failed to reschedule notification");
//   //       throw error;
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   },
//   //   [fetchNotification]
//   // );

//   return (
//     <NotificationContext.Provider
//       value={{
//         publishCampaign,
//         loading,
//         fetchNotification,
//         // rescheduleNotification,
//         setNotification,
//         notification,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// const useNotification = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error("useNotification must be used within a NotificationProvider");
//   }
//   return context;
// };

// export { NotificationProvider, useNotification };


import React, { createContext, useContext, useCallback, useState } from "react";
import axiosInstance from "../api/api";
import { message } from "antd";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import GlobalNotification from "./NotificationForeGroundPopup";

const NotificationContext = createContext({});

const NotificationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState([]);

  // 1️⃣ Fetch Notifications
  const fetchNotification = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/push_notification/notifications/`);
      const data = response?.data;

      const safeData = Array.isArray(data) ? data : data?.results || [];
      if (JSON.stringify(notification) !== JSON.stringify(safeData)) {
        setNotification(safeData);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [loading, notification]);

  // 2️⃣ Publish campaign
  const publishCampaign = useCallback(
    async (formPayload = {}) => {
      try {
        setLoading(true);

        const { data } = await axios.post(
          `${BASE_URL}/push_notification/notification/create/`,
          formPayload,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );

        // Show popup immediately
        GlobalNotification.show(
          data?.title || "New Notification",
          data?.description || "Your campaign has been published!",
          data?.link || null
        );

        message.success("Campaign published successfully!");
        await fetchNotification(); // Refresh the list

        return data;
      } catch (error) {
        console.error("Error publishing campaign:", error);
        message.error("Failed to publish campaign");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchNotification]
  );

  // 3️⃣ Reschedule notification
  // const rescheduleNotification = useCallback(
  //   async (id, payload = {}) => {
  //     try {
  //       setLoading(true);

  //       const { data } = await axios.post(
  //         `${BASE_URL}/push_notification/notification/${id}/reschedule/`,
  //         payload,
  //         { headers: { "Content-Type": "application/json" }, withCredentials: true }
  //       );

  //       message.success("Notification rescheduled successfully!");
  //       await fetchNotification(); // Refresh list after rescheduling

  //       return data;
  //     } catch (error) {
  //       console.error("Error rescheduling notification:", error);
  //       message.error("Failed to reschedule notification");
  //       throw error;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [fetchNotification]
  // );

  return (
    <NotificationContext.Provider
      value={{
        publishCampaign,
        loading,
        fetchNotification,
        // rescheduleNotification,
        setNotification,
        notification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export { NotificationProvider, useNotification };
