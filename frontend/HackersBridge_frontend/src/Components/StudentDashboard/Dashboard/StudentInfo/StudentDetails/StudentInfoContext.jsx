import { createContext, useState, useCallback, useContext } from "react";
import axiosInstance from "../../../../dashboard/api/api";



const StudentInfoContext = createContext();


const StudentInfoProvider = ({ children }) => {

    const [studentDetails, setStudentDetails] = useState();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState();
    const [courseInfo, setCourseInfo] = useState();



    const fetchStudentDetails = useCallback (async () => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/Student_login/student_info/`);
            const data = response.data;
            setUsername(data?.studentinfo?.name)
            
            setStudentDetails(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
                return data;
            }
            return prevData;
            });

        } catch (error) {
        console.error('Error fetching Student Data', error);
        } finally {
        setLoading(false);
        }
    }, [loading]);



     // FETCH COURSE INFO OF SPEIFIC COURSE 
        const fetchCourseInfo = useCallback (async (courseId) => {
            if (!courseId) return null;

            setLoading(true);
            try {
                const response = await axiosInstance.get(`/Student_login/student/course-info/${courseId}/` );
                const data = response.data;
                
                setCourseInfo(prevData => {
                    if(JSON.stringify(prevData) !== JSON.stringify(data)){
                    return data;
                    }
                    return prevData;
                });
        
            } catch (error) {
                console.error('Error fetching Batches Data', error);
            } finally {
                setLoading(false);
            }
        }, [loading]);
        
                    
        




    return (
        <StudentInfoContext.Provider value={{ studentDetails, username, loading, fetchStudentDetails, courseInfo, fetchCourseInfo }}>
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