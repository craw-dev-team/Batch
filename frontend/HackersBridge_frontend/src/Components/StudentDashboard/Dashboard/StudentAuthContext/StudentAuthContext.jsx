import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import BASE_URL from "../../../../ip/Ip";

const StudentAuthContext = createContext();

export const StudentAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user using cookies
  const fetchUser = async () => {
  //   try {
  //     // Make sure the GET request does not send username and password
  //     const response = await axios.get(`${BASE_URL}/Student_login/user_student/`, {
  //       withCredentials: true,  // This ensures cookies are sent along with the request
  //     });
  
  //     if (response?.data?.user_info?.role === "student") {
  //       setUser({ role: response.data.user_info.role });
  //     } else {
  //       logout(false);
  //     }
  //   } catch (error) {
  //     console.error("Fetch user failed:", error);
  //     logout(false);  // Log out silently if auth fails
  //   } finally {
  //     setLoading(false);
  //   }
  };
  

  // useEffect(() => {
  //   fetchUser();
  // }, []);

  // Login function
  const login = async (username, password) => {
  //   try {
  //     const response = await axios.post(`${BASE_URL}/Student_login/only_student_login/`,
  //       { username, password },
  //       { withCredentials: true } // ⬅️ Important: to handle cookies
  //     );

  //     console.log(response);
      
  //     if (response?.data?.user_info?.role === "student") {
  //       await fetchUser();
  //       return true;
  //     } else {
  //       message.error("Invalid credentials or not a student.");
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Login failed:", error.response || error.message);

  //     const errorData = error?.response?.data?.error;
  //     if (errorData && typeof errorData === "object") {
  //       const errorMessages = Object.entries(errorData)
  //         .map(([field, messages]) =>
  //           Array.isArray(messages) ? messages.join(" ") : messages
  //         )
  //         .join(" | ");
  //       message.error(errorMessages || "Something went wrong");
  //     } else {
  //       message.error("Something went wrong");
  //     }

  //     return false;
  //   }
  };

  // Logout
  const logout = async (redirect = true) => {
    // try {
    //   await axios.post(`${BASE_URL}/api/logout/`, {}, { withCredentials: true });
    // } catch (err) {
    //   console.warn("Logout request failed or already logged out");
    // }

    // setUser(null);
    // if (redirect) {
    //   window.location.href = "/";
    // }
  };

  return (
    <StudentAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => useContext(StudentAuthContext);
