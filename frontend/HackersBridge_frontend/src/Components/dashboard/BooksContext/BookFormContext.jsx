import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";


const BookFormContext = createContext();

const initialFormData = {
    courseName : "",
    courseCode : "",
    courseDuration : "",
    courseCertification : "",
};

export const BookFormProvider = ({ children }) => {
    const [bookFormData, setBookFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [bookData, setBookData] = useState([]);
    const [loading, setLoading] = useState(false);  // Loading state to manage fetch state

    const resetBookForm = () => {
        setBookFormData(initialFormData);
        setErrors({});
    };

    // Fetch courses from API
    const fetchBooks = async () => {
        if (loading) return;  // Prevent multiple fetches at the same time

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found, user might be logged out.");
            return;
        };


        setLoading(true);  // Set loading state
        try {
            const response = await axios.get(`${BASE_URL}/api/books/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );
            const data = response?.data;
            
            // Update state only if data has changed
            setBookData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

            // console.log('Courses Data Updated:', data); // Log new data here
        } catch (error) {
            console.error('Error fetching Courses Data', error);
        } finally {
            setLoading(false);  // Reset loading state after fetch
        }
    };

    

    return (
        <BookFormContext.Provider value={{ bookFormData, loading, setBookFormData, errors, setErrors, resetBookForm, bookData, setBookData, fetchBooks }}>
            {children}
        </BookFormContext.Provider>
    );
};

export const useBookForm = () => useContext(BookFormContext);
