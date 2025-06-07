import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";
import dayjs from "dayjs";


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
    const [loading, setLoading] = useState(false);  // Loading state to manage fetch state

    const [selectedOption, setSelectedOption] = useState("this month");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const resetBookForm = () => {
        setBookFormData(initialFormData);
        setErrors({});
    };

        // Fetch Books data  
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

                // console.log('Books Data Updated:', data); // Log new data here
            } catch (error) {
                console.error('Error fetching Books Data', error);
            } finally {
                setLoading(false);  // Reset loading state after fetch
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
        //         const response = await axios.get(`${BASE_URL}/api/books/students/`, 
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
            if (loading) return;

            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token found, user might be logged out");
                return;
            }

            setLoading(true);
            try {
                    let url = `${BASE_URL}/api/books/students/`;

                    // If a specific filter is selected
                    if (filter && filter !== "") {
                        url = `${BASE_URL}/api/books/students/on_date/`;

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

                    const response = await axios.get(url, 
                        { headers: { Authorization: `Bearer ${token}`},
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
                    setLoading(false)
                }
        };


    return (
        <BookFormContext.Provider value={{ bookFormData, loading, setBookFormData, errors, setErrors, resetBookForm, bookData, setBookData, fetchBooks, booksCountData, selectedOption, setSelectedOption, startDate, setStartDate, endDate, setEndDate, handleBookFilter }}>
            {children}
        </BookFormContext.Provider>
    );
};

export const useBookForm = () => useContext(BookFormContext);
