import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";

const StudentAuthContext = createContext();

export const StudentAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);


  const login = async (username, password) => {

    try {
      const response = await axios.post(`${BASE_URL}/api/login/`,
         {
        username,
        password,
      },
      // { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }

    );

      if (response.data.token) {
        setToken(response.data.token);
        setUser({ username: response.data.username, role: response.data.role });
        
      }
    } catch (error) {
      console.error("Login failed:", error.response || error.message);

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
        console.log(error);
        
          message.error("Something went wrong");
      }
  }
};




const logout = (redirect = true) => {
  console.log("Logging out user..."); // Debugging purpose
  if (!localStorage.getItem("token")) {
      console.warn("Token already removed, possible unexpected logout.");
      return; // Prevent redundant logouts
  }

  if (redirect) {
      window.location.href = "/"; // Redirect only when necessary
  }
};



  return (
    <StudentAuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useAuth = () => useContext(StudentAuthContext);