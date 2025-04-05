import axios from "axios";
import { createContext, useContext, useState } from "react";
import BASE_URL from "../../../ip/Ip";


const SpecificStudentContext = createContext();

const SpecificStudentProvider = ({ children }) => {
    const [specificStudent, setSpecificStudent] = useState();
    const [loading, setLoading] = useState(false);


    const fetchSpecificStudent = async (studentId) => {
        if (loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };
        
        setLoading(true)

        try {
            const response = await axios.get(`${BASE_URL}/api/students/info/${studentId}/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            const data = response?.data
            // console.log(data);
            
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

    return (
            <SpecificStudentContext.Provider value={{ specificStudent, fetchSpecificStudent }}>
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