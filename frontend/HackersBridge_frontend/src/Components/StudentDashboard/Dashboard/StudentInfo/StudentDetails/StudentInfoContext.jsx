import axios from "axios";
import { createContext, useState, useCallback, useContext } from "react";
import BASE_URL from "../../../../../ip/Ip";



const StudentInfoContext = createContext();


const StudentInfoProvider = ({ children }) => {

    const [studentDetails, setStudentDetails] = useState();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState();

    const fetchStudentDetails = useCallback (async () => {
        if (loading) return;
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };

        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/Student_login/student_info/`,
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
            withCredentials: true,
            }  
            );
            const data = response.data;
            setUsername(data?.studentinfo?.name)
            // console.log(data);
            
            setStudentDetails(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
            }
            return prevData;
            });

            // console.log('Batches Data ', data)
        } catch (error) {
        console.error('Error fetching Student Data', error);
        } finally {
        setLoading(false);
        }
    }, [loading]);

    return (
        <StudentInfoContext.Provider value={{ studentDetails, username, loading, fetchStudentDetails }}>
            {children}
        </StudentInfoContext.Provider>
    )
};

    const useStudentInfo = () => {
        const context = useContext(StudentInfoContext);
        if(!context) {
            throw new Error("useStudentInfo must be used within a StudentInfoProvider");
        }
        return context;
    };

    export { StudentInfoProvider , useStudentInfo };