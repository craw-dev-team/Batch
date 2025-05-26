import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem('role' || ''));
  const [token, setToken] = useState(localStorage.getItem('token' || ''));
  const [loading, setLoading] = useState(true);


  // useEffect(() => {
  //   const storedUser = localStorage.getItem("role");
  //   if (token && storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  //   setLoading(false);
  // }, [token]);


  const register = async (userData) => {
    // if (!token) {
    //     console.error("No token found, user might be logged out.");
    //     return;
    // };

    try {
      await axios.post(`${BASE_URL}/api/register/`, 
        userData,
        // { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
      message.success("Registration successful");
    } catch (error) {
      message.error(error.response?.data?.error || "Registration failed");
    }
  };


  // const fetchUser = async () => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/Student_login/user_student/`, {
  //       withCredentials: true,
  //     });

  //     console.log(res);
      
  //     const role = res?.data?.user_info?.role;

  //     if (role) {
  //       setUser({ ...res.data.user_info });
  //     } else {
  //       setUser(null);
  //     }
  //   } catch (err) {
  //     console.error("User fetch failed:", err);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchUser();
  // }, []);



  const universalLogin = async (username, password) => {
    if(!username && !password) return;


    try {
      const response = await axios.post(
        `${BASE_URL}/api/login/`,
        { username, password },
        { withCredentials: true }
      );
      // console.log(response); // Check the response format
  
      const role = response?.data?.user_info?.role;
      const token = response?.data?.user_info?.token;
  
      setRole(role);
      setToken(token);
      localStorage.setItem('role', role)
      localStorage.setItem('token', token)
  
      if (!role) throw new Error("Role not found in response");
  
      return response?.data; // Return the full response body to be used in handleLogin
    } catch (error) {
      console.error("Login failed:", error.response || error.message);
  
      const errorData = error?.response?.data?.error;
      if (errorData && typeof errorData === "object") {
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
  




const logout = (redirect = true) => {


  setRole("");
  setToken("");

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  delete axios.defaults.headers.common["Authorization"];

  if (redirect) {
      window.location.href = "/"; // Redirect only when necessary
  }
};



  return (
    <AuthContext.Provider value={{ role, token, universalLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);