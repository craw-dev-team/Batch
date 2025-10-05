import { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import axiosInstance from './../api/api';
import axios from 'axios';
import BASE_URL from './../../../ip/Ip';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem('role' || ''));
  // const [token, setToken] = useState(localStorage.getItem('token' || ''));
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  

// useEffect(() => {
//   const checkSession = async () => {

//     setLoading(true);
//     try {
//       const res = await axiosInstance.get(`/api/user-info/`);

//       const role = res?.data?.user_info?.role;
//       const user_name = res?.data?.user_info?.first_name ?? (res?.data?.user_info?.user_name ?? res?.data?.user_info?.username);


//       setUsername(user_name);
//       setRole(role);
//     } catch (err) {
//       console.warn("Not logged in or session expired");
//       setUsername(null);
//       setRole(null);
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   checkSession();
// }, []);



  const register = async (userData) => {
    // if (!token) {
    //     console.error("No token found, user might be logged out.");
    //     return;
    // };

    // try {
    //   await axios.post(`${BASE_URL}/api/register/`, 
    //     userData,
    //     { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
    //   );
    //   message.success("Registration successful");
    // } catch (error) {
    //   message.error(error.response?.data?.error || "Registration failed");
    // }
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



  const universalLogin = async (username, password, recaptchaToken) => {
    if(!username && !password) return;

    setLoading(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/login/`,
        { username, password, recaptcha_token: recaptchaToken, },
        { withCredentials: true }
      );
      console.log(response);
      
      const role = response?.data?.user_info?.role;
      const user_name = response?.data?.user_info?.first_name ?? response?.data?.user_info?.user_name;
      
      // const token = response?.data?.user_info?.token;
      setUsername(user_name)
      setRole(role);
      // setToken(token)

      localStorage.setItem('role', role)
      // localStorage.setItem('token', token)
      localStorage.setItem('name', user_name)
  
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
    } finally {
      setLoading(false)
    }
  };
  






  const logout = async (redirect = true) => {
    try {
      // Send logout request to backend to clear cookies
      const response = await axiosInstance.post(`/api/logout/`, {});

      // Clear frontend context/state if any
      setUsername(null);
      setRole(null);
      localStorage.removeItem("role")
      // localStorage.removeItem("token")
      localStorage.removeItem("name")

      // Redirect after logout (optional)
      if (redirect) {
        window.location.href = "/"; // or navigate("/")
      }
    } catch (err) {
      console.warn("Logout error:", err?.response || err.message);
    }
  };




  return (
    <AuthContext.Provider value={{ role, username, loading, universalLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);