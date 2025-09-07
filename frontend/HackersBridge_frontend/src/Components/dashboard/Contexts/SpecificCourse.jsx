import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/api";





const SpecificCourseContext = createContext();

const SpecificCourseProvider = ({ children }) => {
    const [specificCourse, setSpecificCourse] = useState();
    const [loading, setLoading] = useState(false);
    // const [specificCourseStudents, setSpecificCourseStudents] = useState()


    const fetchSpecificCourse = async (courseId) => {
        if (loading) return;

        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/course/info/${courseId}/` )
            const data = response?.data
            
            setSpecificCourse(data);

        } catch (error) {
            console.error('Error fetching SpecificCourse Data', error)
        } finally {
            setLoading(false)
        };
    };


    // FETCH SPECIFIC COORDINATOR STUDENTS 
    // const fetchSpecificCoordinatorStudents = async (coordinatorId) => {
    //     if (loading) return;

    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         console.error("No token found, user might be logged out.");
    //         return;
    //     };

    //     setLoading(true)

    //     try {
    //         const response = await axios.get(`${BASE_URL}/api/coordinators/${coordinatorId}/students/`, 
    //             { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
    //             withCredentials : true
    //         }
    //         )
    //         const data = response?.data
    //         // console.log(data);
            

    //         setSpecificCourseStudents(prevData => {
    //             if (JSON.stringify(prevData) !== JSON.stringify(data)) {
    //                 return data;
    //             }
    //             return prevData;
    //         })

    //     } catch (error) {
    //         console.error('Error fetching SpecificCoordinatorStudents Data', error)
    //     } finally {
    //         setLoading(false)
    //     }
    // };


    return (
        <SpecificCourseContext.Provider value={{ loading, specificCourse, fetchSpecificCourse }}>
            {children}
        </SpecificCourseContext.Provider>
    )

};

const useSpecificCourse = () => {
    const context = useContext(SpecificCourseContext);
    if (!context) {
        throw new Error('Specific Course must be used within Specific Coourse Provider')
    }
    return context
}

export { SpecificCourseProvider, useSpecificCourse }