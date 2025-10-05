import { createContext, useContext, useState } from "react"
import axiosInstance from "../api/api";
import PageNotFound from './../../../Pages/PageNotFound';



const StudentFormContext = createContext();

const initialFormData = {
    enrollmentNumber : "",
    studentName : "",
    dateOfBirth : "",
    dateOfJoining : "",
    phoneNumber : "",
    alternatePhoneNUmber : "",
    emailAddress : "",
    studentAddress : "",
    course : [],
    language : "",
    mode : "",
    preferredWeek : "",
    location : "",
    guardianName : "",
    guardianPhoneNumber : "",
    courseCounsellor : "",
    supportCoordinator : "",
    note : "",
    // studentProfilePicture : "",
};

const StudentFormProvider = ({ children }) => {

    const [studentFormData, setStudentFormData] = useState(initialFormData);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(false);  // Loading state to manage fetch state
    const [errors, setErrors] = useState({});
    
    const [studentsCounts, setStudentsCounts] = useState();
    const [allStudentData, setAllStudentData] = useState([]);
    

    // Function to reset form
    const resetStudentForm = () => {
        setStudentFormData(initialFormData);
    };

    const fetchStudents = async ({ page = 1, pageSize = 30, search = '', mode = '', language = '', preferred_week = '', location = '', status = '', date_of_joining_after = '', date_of_joining_before = '' } = {}) => {
        if (loading) return;  // Prevent multiple fetches at the same time

        setLoading(true);  // Set loading state
        try {
            const response = await axiosInstance.get(`/api/students/`, { 
                
                params: {
                    page,
                    page_size: pageSize,
                    search,
                    mode ,
                    language,
                    preferred_week,
                    location,
                    status,
                    date_of_joining_after,
                    date_of_joining_before,
                },
            }
            );
            const data = response?.data;

            // Update state only if data has changed
            setStudentData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

        } catch (error) {
            console.error('Error fetching student Data', error);
        } finally {
            setLoading(false);  // Reset loading state after fetch
        }
    };



    const fetchStudentCount = async (type = '', page = 1, pageSize = 50) => {
        if (loading) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/studentscraw/`, {
                params: {
                    type,
                    page,
                    page_size: pageSize,
                    
                }
            } );
            
            const data = response?.data;                                
            setStudentsCounts({ type, page: data.page, ...data });

        } catch (error) {
        console.error('Error fetching Batches Data', error);
        } finally {
        setLoading(false);
        }
    };


// FETCH ALL STUDENTS TO DISPLAY IN SELECT FIELD WHEN CREATE BATCH
const fetchAllStudent = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
        const response = await axiosInstance.get(`/api/allstudents/` );
        const data = response?.data;        
        
        setAllStudentData(prevData => 
            JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
        );

    } catch (error) {
      console.error('Error fetching Batches Data', error);
    } finally {
      setLoading(false);
    }
}



// delete student 
 const handleDeleteStudent = async (studentId) => {
    if (!studentId) return;

    try {
        const response = await axiosInstance.delete(`/api/students/delete/${studentId}/`);

        if (response.status === 204) {
            // Make sure Student Data is an array before filtering
            if (Array.isArray(studentData)) {
                setStudentData(prevStudents => prevStudents?.filter(student => student.id !== studentId));
                
                setTimeout(() => {
                    setSearchTerm('')
                    fetchStudents({
                        page: currentPage,
                        pageSize: pageSize,
                        search: searchTerm,
                        mode,
                        language,
                        preferred_week,
                        location,
                        status,
                        date_of_joining_after,
                        date_of_joining_before
                    });
                }, 2000);
            } else {
                // console.error('Student Data is not an array');
            }
        }
    } catch (error) {
        setLoading(false);
    
        if (error.response) {
            // console.error("Server Error Response:", error.response.data);
    
            // Extract error messages and show each one separately
            Object.entries(error.response.data).forEach(([key, value]) => {
                value.forEach((msg) => {
                    message.error(`${msg}`);
                });
            });
        } else if (error.request) {
            // console.error("No Response from Server:", error.request);
            message.error("No response from server. Please check your internet connection.");
        } else {
            // console.error("Error Message:", error.message);
            message.error("An unexpected error occurred.");
        }
    }       
    };

    

    return (
        <StudentFormContext.Provider value={{ studentFormData, loading, setStudentFormData, errors, setErrors, resetStudentForm, studentData, setStudentData, fetchStudents, studentsCounts, fetchStudentCount, allStudentData, fetchAllStudent, handleDeleteStudent  }}>
            {children}
        </StudentFormContext.Provider>
    );
};


const useStudentForm = () => {
    const context = useContext(StudentFormContext);
    if(!context) {
        throw new Error("UseStudentForm must be used within a StudentFormProvider");
    }
    return context;
};

export { StudentFormProvider , useStudentForm };