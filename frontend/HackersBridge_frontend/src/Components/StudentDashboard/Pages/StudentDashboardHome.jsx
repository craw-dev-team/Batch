import { useState, useCallback, useEffect } from "react";
import StudentInfo from "../Dashboard/StudentInfo/StudentDetails/StudentInfo";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";




const StudentDashboardHome = () => {
    const [studentDetails, setStudentDetails] = useState();
    const [loading, setLoading] = useState(false);


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


    useEffect(() => {
        fetchStudentDetails()
        
    },[]);
    
    
    return (
        <>
        <div className="w-full">
            <h1 className="text-2xl font-semibold">Welcome, <span className="text-green-500">{studentDetails?.studentinfo.name}</span> !</h1>
        <StudentInfo />
      {/* other content */}
    </div>
        </>
    )
};

export default StudentDashboardHome;