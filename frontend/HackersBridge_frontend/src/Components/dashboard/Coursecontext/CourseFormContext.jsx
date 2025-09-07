import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/api";



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

        setLoading(true);  // Set loading state
        try {
            const response = await axiosInstance.get(`/api/courses/` );
            const data = response?.data;
            
            // Update state only if data has changed
            setCoursesData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

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
