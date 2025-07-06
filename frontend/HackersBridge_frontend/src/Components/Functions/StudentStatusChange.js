import { message } from "antd";
import axios from "axios";
import BASE_URL from "../../ip/Ip";
import { useState } from "react";


    const statusDescription = {
            "Active": "Student is currently attending classes regularly and participating as expected.",

            "Inactive": "Student has completed the course or is no longer attending classes without any disciplinary issues.",

            "Temp Block": "Student is temporarily blocked due to issues such as pending fees, poor attendance, or inability to attend classes for a valid reason.",

            "Restricted": "Student has been permanently or strictly restricted due to serious misconduct, such as using abusive language towards the coordinator or trainer, violating institute rules, or repeated disruptive behavior."
    }

    export {statusDescription};


// Handle Toggle of student active, inactive, temporary block and restricted 

    const useStudentStatusChange = () => {
        const [studentStatuses, setStudentStatuses] = useState({});

        const handleStudentStatusChange = async ({studentId, newStatus}) => {
            const previousStatus = studentStatuses[studentId]; // store current before update
            //  Optimistically update UI before API call
            setStudentStatuses((prev) => ({ ...prev, [studentId]: newStatus }));

            try {
                await axios.put(`${BASE_URL}/api/students/edit/${studentId}/`, 
                    { status: newStatus },
                    { headers: { 'Content-Type': 'application/json'}, 
                    withCredentials : true
                }
                );
                message.success(`Student status updated to ${newStatus}`);
            } catch (error) {            
                message.error("Failed to update status");
                //  Revert UI if API fails
                setStudentStatuses((prev) => ({ ...prev, [studentId]: previousStatus }));
            }
        };
        return { studentStatuses, setStudentStatuses, handleStudentStatusChange };
    };

    export default useStudentStatusChange;
