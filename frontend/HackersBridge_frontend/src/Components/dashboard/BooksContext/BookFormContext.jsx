import { createContext, useContext, useState, useEffect } from "react";
import dayjs from "dayjs";
import axiosInstance from "../api/api";
import { message } from "antd";


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
    const [booksCountData, setBooksCountData] = useState([]);
    const [selectedOption, setSelectedOption] = useState("this month");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState({
        all: false,
        filter: false,
        delete: false
    });

    const resetBookForm = () => {
        setBookFormData(initialFormData);
        setErrors({});
    };

        // Fetch Books data  
        const fetchBooks = async () => {
            if (loading.all) return;  // Prevent multiple fetches at the same time

            setLoading(prev => ({...prev, all: true }));  // Set loading state
            try {
                const response = await axiosInstance.get(`/api/books/`);
                const data = response?.data;
                
                // Update state only if data has changed
                setBookData(prevData => {
                    if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                        return data;
                    }
                    return prevData;
                });
            } catch (error) {
                message.error('Error fetching Books Data');
            } finally {
                setLoading(prev => ({...prev, all: false }));  // Reset loading state after fetch
            }
        };

    
        // fetch Books Count and student details to whom books is issued for card
        // const fetchBooksCount = async () => {
        //     if (loading) return;

        //     const token = localStorage.getItem('token');
        //     if (!token) {
        //         console.error("Token not found, user might be logged out");
        //         return;
        //     }

        //     setLoading(true)
        //     try {
        //         const response = await axiosInstance.get(`/api/books/students/`, 
        //             { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        //             withCredentials: true
        //         }
        //     );
        //         if (response.status >= 200 && response.status <=300) {
        //             const data = response?.data;

        //            setBooksCountData(prevData => {
        //             if (JSON.stringify(prevData) !== JSON.stringify(data)) {
        //                 return data;
        //             }
        //             return prevData;
        //         });
        //         } else {
        //             console.error(response.data);
        //         } 
                
        //     } catch (error) {
        //         console.error('Error fetching Books Count Data', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };


        // handle filter books by time and date 
        const handleBookFilter = async (filter = "", customStart = null, customEnd = null) => {
            if (loading.filter) return;

            setLoading(prev => ({...prev, filter: true }));
            try {
                    let url = `/api/books/students/`;

                    // If a specific filter is selected
                    if (filter && filter !== "") {
                        url = `/api/books/students/on_date/`;

                        const params = new URLSearchParams();

                        if (filter === "custom" && customStart && customEnd) {
                            params.append("start_date", dayjs(customStart).format("YYYY-MM-DD"));
                            params.append("end_date", dayjs(customEnd).format("YYYY-MM-DD"));
                            params.append("filter_type", "custom");
                        } else {
                            params.append("filter_type", filter.toLowerCase()); // today, yesterday, past week, etc.
                        }

                        url += `?${params.toString()}`;
                    }

                    const response = await axiosInstance.get(url, 
                        { headers: { "Content-Type": "application/json"},
                        withCredentials: true,
                    });

                    if (response.status >= 200 && response.status <=300) {
                    const data = response?.data;

                    setBooksCountData(prevData => {
                        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                            return data;
                        }
                        return prevData;
                        });
                        } else {
                            console.error(response.data);
                        }
            
                } catch (error) {
                    console.log("Error in searching book by filter", error);
                    
                } finally {
                    setLoading(prev => ({...prev, filter: false }) );  // Reset loading state after fetch
                }
        };


        // Delete Function
        const handleDeleteBook = async (bookId) => {
            if (!bookId) return;

            setLoading(prev => ({...prev, delete: true}));
            try {
                const response = await axiosInstance.delete(`/api/books/delete/${bookId}/` );

                if (response.status >= 200 && response.status < 300) {
                    message.success('Book Deleted Successfully');
                    if (Array.isArray(bookData)) {
                        setBookData(prevBooks => prevBooks.filter(book => book.id !== bookId));
                    } else {
                        console.error('BookData is not an array');
                    }
                }
            } catch (error) {
                console.error("Error deleting Book:", error);
            } finally {
                setLoading(prev => ({...prev, delete: false}));  // Reset loading state after fetch
            }
        };

    return (
        <BookFormContext.Provider value={{ bookFormData, loading, setBookFormData, errors, setErrors, resetBookForm, bookData, setBookData, fetchBooks, booksCountData, selectedOption, setSelectedOption, startDate, setStartDate, endDate, setEndDate, handleBookFilter, handleDeleteBook }}>
            {children}
        </BookFormContext.Provider>
    );
};

export const useBookForm = () => useContext(BookFormContext);
