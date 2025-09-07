import { createContext, useContext, useState } from "react";
import { message } from "antd";
import axiosInstance from "../api/api";


const SpecificStudentContext = createContext();

const SpecificStudentProvider = ({ children }) => {
    const [specificStudent, setSpecificStudent] = useState();
    const [loading, setLoading] = useState(false);


    const fetchSpecificStudent = async (studentId) => {
        if (loading) return;

        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/students/info/${studentId}/` );
            const data = response?.data
            
            setSpecificStudent(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

        } catch (error) {
            console.error('Error fetching SpecificStudent Data', error);
        } finally {
            setLoading(false)
        }
    };


     const sendMarksUpdate = async ({ exam_date, marks, courseId, studentId }) => {
        if (!courseId) {
            message.error("Course ID is missing.");
            return;
        }
        try {
            const response = await axiosInstance.patch(`/api/student-course/marks/${courseId}/`,
                { exam_date, marks } );

            if (response.status === 200 || response.status === 201) {
                message.success("Marks updated successfully.");
                // Refresh student data using studentId
                if (studentId) {
                    fetchSpecificStudent(studentId);
                }
            } else {
                message.error("Failed to update marks.");
            }
        } catch (error) {
            console.error("Error updating marks:", error);
            message.error("Error occurred while updating marks.");
        }
    };


    return (
            <SpecificStudentContext.Provider value={{ specificStudent, setSpecificStudent, fetchSpecificStudent, sendMarksUpdate }}>
                {children}
            </SpecificStudentContext.Provider>
    )

};

const useSpecificStudent = () => {
    const context = useContext(SpecificStudentContext);
    if (!context) {
        throw new Error ('specific trainer must be used within a specific trainer provider')
    }
    return context;
}
export { SpecificStudentProvider, useSpecificStudent }