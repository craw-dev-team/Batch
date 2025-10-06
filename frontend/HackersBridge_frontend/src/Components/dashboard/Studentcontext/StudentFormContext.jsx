import { createContext, useContext, useState, useCallback } from "react"
import axiosInstance from "../api/api";
import PageNotFound from './../../../Pages/PageNotFound';
import { message } from "antd";
import { data } from "react-router-dom";



const StudentFormContext = createContext();

const initialFormData = {
    enrollmentNumber : "",
    studentName : "",
    dateOfBirth : "",
    dateOfJoining : "",
    phoneNumber : "",
    alternatePhoneNUmber : "",
    emailAddress : "",
    studentAddress : "",
    course : [],
    language : "",
    mode : "",
    preferredWeek : "",
    location : "",
    guardianName : "",
    guardianPhoneNumber : "",
    courseCounsellor : "",
    supportCoordinator : "",
    note : "",
    tags: [],
    // studentProfilePicture : "",
};

const StudentFormProvider = ({ children }) => {

    const [studentFormData, setStudentFormData] = useState(initialFormData);
    const [studentData, setStudentData] = useState([]);
    const [studentsCache, setStudentsCache] = useState({});
    const [errors, setErrors] = useState({});
    
    const [studentsCounts, setStudentsCounts] = useState();
    const [studentsList, setStudentsList] = useState();
    const [allStudentData, setAllStudentData] = useState([]);
    const [loading, setLoading] = useState({
        students: false,
        count: false,
        studentList: false,
        allStudents: false,
        delete: false
    });
    // store preferred available students for that specific batch
    const [studentsListSelect, setStudentsListSelect] = useState({});
    const [students, setStudents] = useState({});


    // Function to reset form
    const resetStudentForm = () => {
        setStudentFormData(initialFormData);
    };

    // fetch all student data
    const fetchStudents = async (currentFilters = {}, forceFetch = false) => {
        const { page = 1, 
            pageSize = 30, 
            search = '', 
            mode = '', 
            language = '', 
            preferred_week = '', 
            location = '', 
            status = '', 
            date_of_joining_after = '', 
            date_of_joining_before = '' 
        } = currentFilters;

        // Create a cache key based on filters
        const cacheKey = `${status}_${page}_${pageSize}_${search}_${mode}_${language}_${preferred_week}_${location}_${status}_${date_of_joining_after}_${date_of_joining_before}`;

        // Use cached data if available
        // if (studentsCache[cacheKey]) {
        //     setStudentData(studentsCache[cacheKey]);
        //     return;
        // }
        // Bypass cache if forceFetch is true or cache doesn't exist
            if (!forceFetch && studentsCache[cacheKey]) {
                setStudentData(studentsCache[cacheKey]);
                return;
            }

        if (loading.students) return;  

        setLoading(prev => ({ ...prev, students: true }));
        try {
            const response = await axiosInstance.get(`/api/students/`, { 
                
                params: {
                    page,
                    page_size: pageSize,
                    search,
                    mode ,
                    language,
                    preferred_week,
                    location,
                    status,
                    date_of_joining_after,
                    date_of_joining_before,
                },
            }
            );
            const data = response?.data;

            // Update state only if data has changed
            setStudentData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            });

             // Save in cache
            setStudentsCache(prev => ({ ...prev, [cacheKey]: data }));

        } catch (error) {
            console.error('Error fetching student Data', error);
        } finally {
            setLoading(prev => ({ ...prev, students: false }));
        }
    };


    // fetch only student count for cards 
    const fetchStudentCount = async () => {
        if (loading.count) return;
        
        setLoading(prev => ({ ...prev, count: false }));
        try {
            const response = await axiosInstance.get(`/api/studentscraw/summary/`, {
            } );
            
            const data = response?.data;                                            
            setStudentsCounts(data);

        } catch (error) {
        console.error('Error fetching Batches Data', error);
        } finally {
            setLoading(prev => ({ ...prev, count: false }));
        }
    };


    // fetch student list when student count card clicked 
    const fetchStudentList = async (type = '', page = 1, pageSize, search = '') => {
        if (loading.studentList) return;
        
        setLoading(prev => ({ ...prev, studentList: true }));
        try {
            const response = await axiosInstance.get(`/api/studentscraw/list/`, {
                params: {
                    type,
                    page,
                    page_size: pageSize,
                    search
                }
            } );
                        
            const data = response?.data;                     
            setStudentsList(data);

        } catch (error) {
        console.error('Error fetching Batches Data', error);
        } finally {
            setLoading(prev => ({ ...prev, studentList: false }));
        }
    };


    // FETCH ALL STUDENTS TO DISPLAY IN SELECT FIELD WHEN CREATE BATCH
    const fetchAllStudent = useCallback(async () => {
        if (loading.allStudents) return;
        
        setLoading(prev => ({ ...prev, allStudents: false }));
        try {
            const response = await axiosInstance.get(`/api/allstudents/` );
            const data = response?.data;        
            
            setAllStudentData(prevData => 
                JSON.stringify(prevData) !== JSON.stringify(data) ? data : prevData
            );

        } catch (error) {
        console.error('Error fetching Batches Data', error);
        } finally {
            setLoading(prev => ({ ...prev, allStudents: false }));
        }
    }, [loading.allStudents]);


    // delete student 
    const handleDeleteStudent = async (studentId, currentFilters) => {
    if (!studentId) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
        const response = await axiosInstance.delete(`/api/students/delete/${studentId}/`);
        
            if (response.status >= 200 && response.status <= 204) {
                message.success('Student Deleted Successfully');
                try {
                    await fetchStudents(currentFilters);

                } catch (fetchError) {
                    console.error("Fetch error:", fetchError);
                }
            }
        } catch (error) {
            if (error.response) {
            // Extract error messages and show each one separately
            Object.entries(error.response.data).forEach(([key, value]) => {
                value.forEach((msg) => {
                message.error(`${msg}`);
                });
            });
            } else if (error.request) {
            message.error("No response from server. Please check your internet connection.");
            } else {
            message.error("An unexpected error occurred.");
            }
        } finally {
            setLoading((prev) => ({ ...prev, delete: false }));
        }
    };

    
    // HANDLE FETCH PREFFERED AVAILABLE STUDENTS FOR THAT SPECIFIC BATCH
    const fetchAvailableStudents = useCallback(async (batchId) => {              
        try {
            const response = await axiosInstance.get(`/api/batches/${batchId}/available-students/`);
            const data = response.data;
            
            if (!data.available_students) {
                throw new Error("Invalid response format");
            };

            // Format data for the Select component
            const formattedOptions = data.available_students.map(student => ({
                name: student.name,
                studentid: student.id,
                phone: student.phone
            }));
    
            // Update state with students for the specific batchId
            setStudentsListSelect(prev => ({ ...prev, [batchId]: formattedOptions }));
            setStudents(data);                        
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }, [students]);




    return (
        <StudentFormContext.Provider value={{ studentFormData, loading, setStudentFormData, errors, setErrors, resetStudentForm, studentData, setStudentData, fetchStudents, studentsCounts, fetchStudentCount, allStudentData, fetchAllStudent, handleDeleteStudent, studentsList,  fetchStudentList, studentsListSelect,  students, fetchAvailableStudents  }}>
            {children}
        </StudentFormContext.Provider>
    );
};


const useStudentForm = () => {
    const context = useContext(StudentFormContext);
    if(!context) {
        throw new Error("UseStudentForm must be used within a StudentFormProvider");
    }
    return context;
};

export { StudentFormProvider , useStudentForm };