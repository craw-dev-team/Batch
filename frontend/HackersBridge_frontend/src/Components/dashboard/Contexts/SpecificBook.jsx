import { createContext, useContext, useState } from "react";
import BASE_URL from "../../../ip/Ip";
import axios from "axios";





const SpecificBookContext = createContext();

const SpecificBookProvider = ({ children }) => {
    const [specificBook, setSpecificBook] = useState();
    const [loading, setLoading] = useState(false);
    const [studentReceivedBooks, setStudentReceivedBooks] = useState();

    const fetchSpecificBook = async (bookId) => {
        if (loading) return;

        // const token = localStorage.getItem('token');
        // if (!token) {
        //     console.error("No token found, user might be logged out.");
        //     return;
        // };

        setLoading(true);

        try {
            const response = await axios.get(`${BASE_URL}/api/books/info/${bookId}/`, 
                { headers: { 'Content-Type': 'application/json'},
                withCredentials : true
            }
            )
            const data = response?.data
            // console.log(data);
            
            setSpecificBook(data);

        } catch (error) {
            console.error('Error fetching SpecificBook Data', error)
        } finally {
            setLoading(false)
        };
    };


    // fetch list of all student who received books 
    const fetchStudentReceivedBooks = async ({ page = 1, pageSize = 50, search = '' }) => {
        if (loading) return;

        // const token = localStorage.getItem('token');
        // if (!token) {
        //     console.error("No token found, user might be logged out.");
        //     return;
        // };

        setLoading(true);

        try {
            const response = await axios.get(`${BASE_URL}/api/books/issued/`, 
                { headers: { 'Content-Type': 'application/json' },
                withCredentials : true,
                params: {
                    page,
                    page_size: pageSize,
                    search,
                },
            },
            )
            const data = response?.data
            // console.log(data);
            
            setStudentReceivedBooks(data);

        } catch (error) {
            console.error('Error fetching list of student received books Data', error)
        } finally {
            setLoading(false)
        };
    };



    return (
        <SpecificBookContext.Provider value={{ loading, specificBook, fetchSpecificBook, studentReceivedBooks, fetchStudentReceivedBooks }}>
            {children}
        </SpecificBookContext.Provider>
    )

};

const useSpecificBook = () => {
    const context = useContext(SpecificBookContext);
    if (!context) {
        throw new Error('Specific Course must be used within Specific Coourse Provider')
    }
    return context
}

export { SpecificBookProvider, useSpecificBook }