
// src/api/axiosInstance.js
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import { createBrowserHistory } from "history";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
});


// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );



// if token expires it send request to backend for new token and set that in cookie 

// const history = createBrowserHistory();

let isRefreshing = false;
let refreshSubscribers = [];



// // Call queued requests once refresh is done
function onRefreshed() {
  console.log("🔄 Running queued requests after token refresh...");
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Handle both 401 and 403
//     if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
//       if (isRefreshing) {
//         console.log("⏳ Refresh already in progress. Queuing request...");
//         return new Promise((resolve) => {
//           refreshSubscribers.push(() => resolve(axiosInstance(originalRequest)));
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         console.log("🚀 Sending refresh token request to server...");
//         const response = await axiosInstance.post(`/api/token/refresh/`, {}, { withCredentials: true });

//         console.log("✅ Token refreshed successfully:", response.data);

//         onRefreshed();
//         console.log("📌 Retrying original request:", originalRequest.url);

//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // 🔴 Refresh failed (token expired, blacklisted, or missing)
//         console.error("❌ Refresh failed. Redirecting to login.", refreshError);

//         message.error("Your session has expired. Please log in again.");
//         localStorage.clear();

//         // Redirect to login after short delay
//         setTimeout(() => {
//           if (window.location.pathname !== "/") {
//             window.location.replace("/");  // 🔄 Hard redirect (clears history)
//           }
//         }, 1500);


//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );



// new 
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("📤 Sending request:", config.url, "Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        console.log("⏳ Refresh already in progress. Queuing request:", originalRequest.url);
        return new Promise((resolve) => {
          refreshSubscribers.push(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🚀 Sending refresh token request to /api/token/refresh/");
        console.log("🔍 Cookies before refresh:", document.cookie);
        const response = await axiosInstance.post(`/api/token/refresh/`, {}, { withCredentials: true });

        console.log("✅ Token refreshed successfully:", response.data);
        console.log("🔍 Cookies after refresh:", document.cookie);

        onRefreshed();
        console.log("📌 Retrying original request:", originalRequest.url);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error(
          "❌ Refresh failed. Status:",
          refreshError.response?.status,
          "Details:",
          refreshError.response?.data
        );

        const isTokenMissing =
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403 ||
          refreshError.response?.status === 400 ||
          refreshError.response?.status === 422;

        if (isTokenMissing) {
          console.log("🔴 Refresh token expired or missing. Logging out...");
          try {
            document.cookie = "access_token=; Max-Age=0; path=/;";
            document.cookie = "refresh_token=; Max-Age=0; path=/;";
            document.cookie = "user_role=; Max-Age=0; path=/;";
            window.location.href = "/";

            message.error("Your session has expired. Please log in again.");

            console.log("🔍 localStorage before clear:", { ...localStorage });
            localStorage.clear();
            console.log("🗑️ localStorage after clear:", { ...localStorage });

            console.log("🔍 sessionStorage before clear:", { ...sessionStorage });
            sessionStorage.clear();
            console.log("🗑️ sessionStorage after clear:", { ...sessionStorage });

            try {
              console.log("🚪 Sending logout request to /api/logout");
              await axiosInstance.post("/api/logout/", {}, { withCredentials: true });
              console.log("🗑️ Backend cookies invalidated via logout endpoint");
              console.log("🔍 Cookies after logout:", document.cookie);
            } catch (logoutError) {
              console.error("❌ Failed to call logout endpoint:", logoutError);
            }

            console.log("📢 Dispatching logout event");
            window.dispatchEvent(new CustomEvent("logout"));
            console.log("🚀 Navigating to / using history");
            history.replace("/");
          } catch (err) {
            console.error("❌ Error during logout handling:", err);
            console.log("🚀 Fallback to window.location.replace");
            history.replace("/"); // Prefer history over window.location
          }
        } else {
          console.warn(
            "⚠️ Refresh failed for other reason (status: %s). Not redirecting.",
            refreshError.response?.status
          );
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("❌ Request failed with status:", error.response?.status, "URL:", originalRequest?.url);
    return Promise.reject(error);
  }
);

































// export const setupInterceptors = () => {
//   const interceptor = axiosInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;

//       // Handle 401 or 403 errors (access token expired or missing)
//       if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
//         if (isRefreshing) {
//           console.log("⏳ Refresh already in progress. Queuing request:", originalRequest.url);
//           return new Promise((resolve) => {
//             refreshSubscribers.push(() => resolve(axiosInstance(originalRequest)));
//           });
//         }

//         originalRequest._retry = true;
//         isRefreshing = true;

//         try {
//           console.log("🚀 Sending refresh token request to /api/token/refresh/");
//           console.log("🔍 Cookies before refresh:", document.cookie); // HTTP-only cookies not visible
//           const response = await axiosInstance.post(`/api/token/refresh/`, {}, { withCredentials: true });

//           console.log("✅ Token refreshed successfully:", response.data);
//           console.log("🔍 Cookies after refresh:", document.cookie);

//           if (response.data.access_token) {
//             console.log("🔐 Storing new access token:", response.data.access_token);
//             // localStorage.setItem("token", response.data.access_token); // Uncomment if needed
//           }

//           onRefreshed();
//           console.log("📌 Retrying original request:", originalRequest.url);

//           return axiosInstance(originalRequest);
//         } catch (refreshError) {
//           console.error(
//             "❌ Refresh failed. Status:",
//             refreshError.response?.status,
//             "Details:",
//             refreshError.response?.data
//           );

//           // Broaden status codes for expired/missing refresh token
//           const isTokenMissing =
//             refreshError.response?.status === 401 ||
//             refreshError.response?.status === 403 ||
//             refreshError.response?.status === 400 ||
//             refreshError.response?.status === 422; // Add 422 or others based on backend

//           if (isTokenMissing) {
//             console.log("🔴 Refresh token expired or missing. Logging out...");

//             try {
//               // Show error message
//               if (typeof window.message !== "undefined") {
//                 console.log("📢 Displaying error message via Ant Design");
//                 window.message.error("Your session has expired. Please log in again.");
//               } else {
//                 console.warn("⚠️ message object not available, falling back to alert");
//                 alert("Your session has expired. Please log in again.");
//               }

//               // Clear storage
//               console.log("🔍 localStorage before clear:", { ...localStorage });
//               localStorage.clear();
//               console.log("🗑️ localStorage after clear:", { ...localStorage });

//               console.log("🔍 sessionStorage before clear:", { ...sessionStorage });
//               sessionStorage.clear();
//               console.log("🗑️ sessionStorage after clear:", { ...sessionStorage });

//               // Call logout endpoint
//               try {
//                 console.log("🚪 Sending logout request to /api/logout");
//                 await axiosInstance.post("/api/logout", {}, { withCredentials: true });
//                 console.log("🗑️ Backend cookies invalidated via logout endpoint");
//                 console.log("🔍 Cookies after logout:", document.cookie);
//               } catch (logoutError) {
//                 console.error("❌ Failed to call logout endpoint:", logoutError);
//               }

//               // Dispatch logout event to clear auth state
//               console.log("📢 Dispatching logout event");
//               window.dispatchEvent(new CustomEvent("logout"));

//               // Redirect immediately
//               console.log("🚀 Navigating to / using history");
//               history.replace("/"); // Immediate redirect
//             } catch (err) {
//               console.error("❌ Error during logout handling:", err);
//               // Fallback redirect
//               console.log("🚀 Fallback to window.location.replace");
//               window.location.replace("/");
//             }
//           } else {
//             console.warn(
//               "⚠️ Refresh failed for other reason (status: %s). Not redirecting.",
//               refreshError.response?.status
//             );
//           }

//           return Promise.reject(refreshError);
//         } finally {
//           isRefreshing = false;
//         }
//       }

//       console.error("❌ Request failed with status:", error.response?.status, "URL:", originalRequest?.url);
//       return Promise.reject(error);
//     }
//   );

//   return interceptor;
// };



export default axiosInstance;
