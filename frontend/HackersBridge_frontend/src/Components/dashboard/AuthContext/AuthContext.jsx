import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  const register = async (userData) => {
    try {
      await axios.post(`${BASE_URL}/api/register/`, userData);
      message.success("Registration successful");
    } catch (error) {
      message.error(error.response?.data?.error || "Registration failed");
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/login/`, {
        username,
        password,
      });

      if (response.data.token) {
        setToken(response.data.token);
        setUser({ username: response.data.username, role: response.data.role });
        

        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({ username: response.data.username, role: response.data.role })
        );

        return true;
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);

      const errorData = error?.response?.data?.error; // Extract nested error object

      if (errorData && typeof errorData === "object") {
          // Map through error fields dynamically
          const errorMessages = Object.entries(errorData)
              .map(([field, messages]) => 
                  `${Array.isArray(messages) ? messages.join(" ") : messages}`
              )
              .join(" | ");

          message.error(errorMessages || "Something went wrong");
      } else {
          message.error("Something went wrong");
      }
  }
};

// useEffect(() => {
//   const clearStorageOnClose = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//   };

//   window.addEventListener("beforeunload", clearStorageOnClose);

//   return () => {
//     window.removeEventListener("beforeunload", clearStorageOnClose);
//   };
// }, []);


const logout = (redirect = true) => {
  console.log("Logging out user..."); // Debugging purpose
  if (!localStorage.getItem("token")) {
      console.warn("Token already removed, possible unexpected logout.");
      return; // Prevent redundant logouts
  }

  setUser(null);
  setToken("");

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete axios.defaults.headers.common["Authorization"];

  if (redirect) {
      window.location.href = "/login"; // Redirect only when necessary
  }
};


  // Set default axios headers and handle logout if the user is deleted
//   useEffect(() => {
//     const savedToken = localStorage.getItem("token");
//     const savedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

//     if (savedToken && savedUser) {
//         axios.defaults.headers.common["Authorization"] = `token ${savedToken}`; // ✅ Ensure correct format
//         setToken(savedToken);
//         setUser(savedUser);
//     } else if (!savedToken && !loading) {  // Prevent logout on initial load
//         logout(false);
//     }

//     setLoading(false); // Now state is ready

//     // Axios Response Interceptor to handle unauthorized access
//     const interceptor = axios.interceptors.response.use(
//         (response) => response,
//         (error) => {
//             if (error.response?.status === 401) {
//                 message.error("Session expired. Logging out...");
//                 logout();
//                 console.log(error);
                
//             }
//             return Promise.reject(error);
//         }
//     );

//     return () => {
//         axios.interceptors.response.eject(interceptor); // Cleanup on unmount
//     };
// }, [loading]);


  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);