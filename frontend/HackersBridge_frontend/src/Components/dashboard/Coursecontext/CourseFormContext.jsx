import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";


const CourseFormContext = createContext();

const initialFormData = {
    courseName : "",
    courseCode : "",
    courseDuration : "",
    courseCertification : "",
};

export const CourseFormProvider = ({ children }) => {
    const [courseFormData, setCourseFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [coursesData, setCoursesData] = useState([]);
    const [loading, setLoading] = useState(false);  // Loading state to manage fetch state

    const resetCourseForm = () => {
        setCourseFormData(initialFormData);
        setErrors({});
    };

    // Fetch courses from API
    const fetchCourses = async () => {
        if (loading) return;  // Prevent multiple fetches at the same time

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };


        setLoading(true);  // Set loading state
        try {
            const response = await axios.get(`${BASE_URL}/api/courses/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            const data = response?.data;
            
            // Update state only if data has changed
            setCoursesData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

            // console.log('Courses Data Updated:', data); // ✅ Log new data here
        } catch (error) {
            console.error('Error fetching Courses Data', error);
        } finally {
            setLoading(false);  // Reset loading state after fetch
        }
    };

    

    return (
        <CourseFormContext.Provider value={{ courseFormData, loading, setCourseFormData, errors, setErrors, resetCourseForm, coursesData, setCoursesData, fetchCourses }}>
            {children}
        </CourseFormContext.Provider>
    );
};

export const useCourseForm = () => useContext(CourseFormContext);
