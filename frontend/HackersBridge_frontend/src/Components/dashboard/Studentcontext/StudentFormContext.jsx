import axios from "axios";
import { createContext, useContext, useState } from "react"
import BASE_URL from "../../../ip/Ip";



const StudentFormContext = createContext();

const initialFormData = {
    enrollmentNumber : "",
    studentName : "",
    dateOfBirth : "",
    dateOfJoining : "",
    phoneNumber : "",
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
    
    // Function to reset form
    const resetStudentForm = () => {
        setStudentFormData(initialFormData);
    };

    const fetchStudents = async () => {
        if (loading) return;  // Prevent multiple fetches at the same time

        setLoading(true);  // Set loading state
        try {
            const response = await axios.get(`${BASE_URL}/api/students/`);
            const data = response?.data;
            // console.log(data);          
            // Update state only if data has changed
            setStudentData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

            // console.log('Student Data Updated:', data); //  Log new data here
        } catch (error) {
            console.error('Error fetching student Data', error);
        } finally {
            setLoading(false);  // Reset loading state after fetch
        }
    };



  const fetchStudentCount = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
        const response = await axios.get(`${BASE_URL}/api/studentscraw/`);
        const data = response?.data;
        
        setStudentsCounts(prevData => 
            JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
        );

        console.log('Student Count Data ', data)
    } catch (error) {
      console.error('Error fetching Batches Data', error);
    } finally {
      setLoading(false);
    }
}

    

    return (
        <StudentFormContext.Provider value={{ studentFormData, loading, setStudentFormData, errors, setErrors, resetStudentForm, studentData, setStudentData, fetchStudents, studentsCounts, fetchStudentCount  }}>
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