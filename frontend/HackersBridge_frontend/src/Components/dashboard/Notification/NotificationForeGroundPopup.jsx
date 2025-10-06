// // src/components/GlobalNotification.js
// import { notification } from "antd";
// import React, { useEffect, useRef } from "react";

// let apiInstance;

// const GlobalNotification = () => {
//   const [api, contextHolder] = notification.useNotification();
//   const mounted = useRef(false);

//   useEffect(() => {
//     apiInstance = api;
//   }, [api]);

//   return contextHolder;
// };

// // duration is in seconds
// GlobalNotification.show = (title, description, link = null, duration = 10) => {
//   if (apiInstance) {
//     console.log("🔔 Notification Data:", { title, description, link }); // Debug log

//     apiInstance.open({
//       message: title,
//       description: (
//         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//           <span>{description}</span>
//           {link ? (
//             <a
//               href={link}
//               target="_blank"
//               rel="noopener noreferrer"
//               style={{
//                 color: "#1677ff",
//                 fontWeight: 600,
//                 marginTop: 4,
//               }}
//             >
//               🔗 Visit Page
//             </a>
//           ) : null}
//         </div>
//       ),
//       placement: "topRight",
//       duration,
//       showProgress: true,
//       pauseOnHover: true,
//     });
//   } else {
//     setTimeout(() => GlobalNotification.show(title, description, link, duration), 10);
//   }
// };

// export default GlobalNotification;



// src/components/GlobalNotification.js
// import { notification } from "antd";
// import React, { useEffect, useRef } from "react";

// let apiInstance;

// const GlobalNotification = () => {
//   const [api, contextHolder] = notification.useNotification();
//   const mounted = useRef(false);

//   useEffect(() => {
//     apiInstance = api;
//   }, [api]);

//   return contextHolder;
// };

// // duration is in seconds
// GlobalNotification.show = (title, description, duration = 10) => {
//   if (apiInstance) {
//     apiInstance.open({
//       message: title,
//       description,
//       placement: "topRight",
//       duration,
//       showProgress: true,
//       pauseOnHover: true,
//     });
//   } else {
//     // If not mounted yet, retry after a tiny delay
//     setTimeout(() => GlobalNotification.show(title, description, duration), 10);
//   }
// };

// export default GlobalNotification;


import { notification } from "antd";
import React, { useEffect, useRef } from "react";

let apiInstance;

const GlobalNotification = () => {
  const [api, contextHolder] = notification.useNotification();
  const mounted = useRef(false);

  useEffect(() => {
    apiInstance = api;
  }, [api]);

  return contextHolder;
};

// duration is in seconds
GlobalNotification.show = (title, description, link = null, duration = 10) => {
  if (apiInstance) {
    // console.log("🔔 Notification Data:", { title, description, link }); 

    apiInstance.open({
      message: title,
      description: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>{description}</span>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1677ff",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              🔗 Visit Page
            </a>
          ) : null}
        </div>
      ),
      placement: "topRight",
      duration,
      showProgress: true,
      pauseOnHover: true,
    });
  } else {
    setTimeout(() => GlobalNotification.show(title, description, link, duration), 10);
  }
};


// GlobalNotification.show = (title, description, link = null, duration = 10) => {
//   if (apiInstance) {
//     apiInstance.open({
//       message: title,
//       description: (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 4,
//             // Optional: make it visually clear it's clickable
//             cursor: link ? "pointer" : "default",
//           }}
//         >
//           <span>{description}</span>
//           {/* Optional: hide the "Visit Page" link since whole popup is clickable */}
//           {/* {link && (
//             <span style={{ color: "#1677ff", fontWeight: 600, marginTop: 4 }}>
//               🔗 Visit Page
//             </span>
//           )} */}
//         </div>
//       ),
//       placement: "topRight",
//       duration,
//       showProgress: true,
//       pauseOnHover: true,
//       // 🔥 Make the entire notification clickable
//       onClick: () => {
//         if (link) {
//           // Open in same tab (use _blank if you prefer new tab)
//           window.open(link, "_self"); // or "_blank"
//         }
//       },
//       // Optional: style the notification box itself
//       style: {
//         cursor: link ? "pointer" : "default",
//       },
//     });
//   } else {
//     setTimeout(() => GlobalNotification.show(title, description, link, duration), 10);
//   }
// };

export default GlobalNotification;