import React, { useEffect } from "react";
import { notification } from "antd";
// import { onMessageListener } from "../../../Firebase/fcm.js"; // adjust path if needed

const NotificationPopup = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (payload) => {
    const { title, body, image } = payload?.notification || {};
    api.open({
      message: title || "New Notification",
      description: (
        <div style={{ display: "flex", alignItems: "center" }}>
          {image && (
            <img
              src={image}
              alt="notification"
              style={{
                width: 50,
                height: 50,
                marginRight: 10,
                borderRadius: 5,
                objectFit: "cover",
              }}
            />
          )}
          <span>{body}</span>
        </div>
      ),
      duration: 30,
      placement: "topRight",
      style: {
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        padding: 12,
        maxWidth: 350,
      },
    });
  };

//   useEffect(() => {

//     onMessageListener()
//       .then((payload) => {
//         console.log("Foreground notification:", payload);
//         showNotification(payload);
//       })
//       .catch((err) => console.log("Failed to receive notification:", err));
//   }, []);

//   return <>{contextHolder}</>;
};

export default NotificationPopup;
