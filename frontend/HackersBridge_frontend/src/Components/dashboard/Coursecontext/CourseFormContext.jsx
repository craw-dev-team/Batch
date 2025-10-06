import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/api";
import { all } from "axios";
import { message } from "antd";



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
    const [loading, setLoading] = useState({
        all: false,
        delete: false
    });  // Loading state to manage fetch state

    const resetCourseForm = () => {
        setCourseFormData(initialFormData);
        setErrors({});
    };

    // Fetch courses from API
    const fetchCourses = async () => {
        if (loading.all) return;  // Prevent multiple fetches at the same time

        setLoading(prev => ({...prev, all: true}));  // Set loading state
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
            setLoading(prev => ({...prev, all: false}));  // Reset loading state after fetch
        }
    };

    
    // Delete Function
    const handleDeleteCourse = async (courseId) => {
        if (!courseId) return;

        setLoading(prev => ({...prev, delete: true}));
        try {
            const response = await axiosInstance.delete(`/api/courses/delete/${courseId}/` );

            if (response.status === 204) {
                message.success('Course Deleted Successfully');
                if (Array.isArray(coursesData)) {
                    setCoursesData(prevCourses => prevCourses.filter(course => course.id !== courseId));
                } else {
                    console.error('coursesData is not an array');
                }
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        } finally {
            setLoading(prev => ({...prev, delete: false}));  // Reset loading state after fetch
        }
    };


    return (
        <CourseFormContext.Provider value={{ courseFormData, loading, setCourseFormData, errors, setErrors, resetCourseForm, coursesData, setCoursesData, fetchCourses, handleDeleteCourse }}>
            {children}
        </CourseFormContext.Provider>
    );
};

export const useCourseForm = () => useContext(CourseFormContext);
