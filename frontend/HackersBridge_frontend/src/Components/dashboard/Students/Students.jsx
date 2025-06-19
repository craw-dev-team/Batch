import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CreateStudentForm from "./CreateStudentForm";
import axios from "axios";
import { Button, message, Popconfirm,  Avatar, Tag, Tooltip, Input, Spin, Empty, Pagination, Dropdown  } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, FilterOutlined , DownOutlined } from '@ant-design/icons';
import BASE_URL from "../../../ip/Ip";
import { useAuth } from "../AuthContext/AuthContext";
import { useStudentForm } from "../Studentcontext/StudentFormContext";
import StudentCards from "../SpecificPage/Cards/StudentCard";

const { Search } = Input;


const Students = () => {
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [activeTab, setActiveTab] = useState('');
    const [selectedStudent, setSelectedStudent] = useState()
    const [isDeleted, setIsDeleted] = useState(false)
    const [studentStatuses, setStudentStatuses] = useState({}); // Store status per student
    
    const { studentData, loading, setLoading, setStudentData, fetchStudents } = useStudentForm();
    const { token } = useAuth();
    
    const navigate = useNavigate();
    
    // for Pagination 
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 30;


    // for filtering data based on mode, language, preferred week, location
    const [sortByMode, setSortByMode] = useState(null);
    const [sortByLanguage, setSortByLanguage] = useState(null);
    const [sortByPreferredWeek, setSortByPreferredWeek] = useState(null);
    const [sortByLocation, setSortByLocation] = useState(null);


    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1)
    };


    // FETCH STUDENTDATA OM MOUNT
    useEffect(() => {
        fetchStudents({  page: currentPage, pageSize, search: searchTerm, mode: sortByMode, language: sortByLanguage, preferred_week: sortByPreferredWeek, location: sortByLocation, status: activeTab })        
    },[!isModalOpen, searchTerm, currentPage, sortByMode, sortByLanguage, sortByPreferredWeek, sortByLocation, activeTab]);

    
    // HANDLE SEARCH INPUT AND DEBOUNCE 
    useEffect(() => {        
        const handler = setTimeout(() => {
          setSearchTerm(inputValue.trimStart());
        }, 500); // debounce delay in ms
        
        return () => {
            clearTimeout(handler); // clear previous timeout on re-typing
        };
    }, [inputValue]);
          

       // Fetch students after deletion or modal interaction
          useEffect(() => {
            setIsDeleted(false); // Reset deletion flag
   
            
            if (studentData) {
                
                const studentsArray = Array.isArray(studentData?.results)
                    ? studentData?.results
                    : [];
    
                // Set a timeout to wait 2 seconds before initializing statuses
                const timer = setTimeout(() => {
                    const initialStatuses = {};
                    studentsArray.forEach((student) => {
                        initialStatuses[student.id] = student.status; 
                    });
    
                    setStudentStatuses(initialStatuses); 
                }, 100);
    
                // Cleanup function to clear the timer if the component unmounts
                return () => clearTimeout(timer);
            };

        // }, [isDeleted, selectedStudent, isModalOpen, studentData]);
        }, [studentData, isModalOpen, isDeleted ]);
    

   // Function to handle Edit BUTTON click
    const handleEditClick = (student) => {
        setSelectedStudent(student); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };

    
   // Delete Function
   const handleDelete = async (studentId) => {
    if (!studentId) return;

    try {
        const response = await axios.delete(`${BASE_URL}/api/students/delete/${studentId}/`, 
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
            withCredentials : true
        }
        );

        if (response.status === 204) {
            // Make sure Student Data is an array before filtering
            if (Array.isArray(studentData)) {
                setStudentData(prevStudents => prevStudents.filter(student => student.id !== studentId));
                
                setTimeout(() => {
                    setSearchTerm('')
                }, 2000);
            } else {
                // console.error('Student Data is not an array');
            }
        }
    } catch (error) {
        setLoading(false);
    
        if (error.response) {
            // console.error("Server Error Response:", error.response.data);
    
            // Extract error messages and show each one separately
            Object.entries(error.response.data).forEach(([key, value]) => {
                value.forEach((msg) => {
                    message.error(`${msg}`);
                });
            });
        } else if (error.request) {
            // console.error("No Response from Server:", error.request);
            message.error("No response from server. Please check your internet connection.");
        } else {
            // console.error("Error Message:", error.message);
            message.error("An unexpected error occurred.");
        }
    }       
};

    // Confirm and Cancel Handlers for delete button
    const confirm = (studentId) => {
        handleDelete(studentId); 
        message.success('Student Deleted Successfully');
    };

    const cancel = () => {
        message.error('Student Deletion Cancelled');
    };


    // Handle Toggle of trainer active, inactive, temporary block and restricted 
    const handleStudentStatusChange = async (studentId, newStatus) => {
        const previousStatus = studentStatuses[studentId]; // store current before update
        //  Optimistically update UI before API call
        setStudentStatuses((prev) => ({ ...prev, [studentId]: newStatus }));

        try {
            await axios.put(`${BASE_URL}/api/students/edit/${studentId}/`, 
                { status: newStatus },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
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


    const handleStudentClick =  async (studentId) => {
        if (!studentId) return;        
        const encodedStudentId = btoa(studentId);        
        navigate(`/students/${encodedStudentId}`);
    };

        
        // HANDLE SORTING OF THE DATA BASED ON MODE, LANGUAGE, PREFERRED WEEK, LOCATION
        // const sortedBatches = useMemo(() => {
        //     let sorted = [...studentData?.results];
        
        
        //     // Apply Filters (Mode, Language, Preferred Week, Location, Course)
        //     if (sortByMode) {
        //         sorted = sorted.filter(student => student.mode === sortByMode);
        //     }
        
        //     if (sortByLanguage) {
        //         sorted = sorted.filter(student => student.language === sortByLanguage);
        //     }
        
        //     if (sortByPreferredWeek) {
        //         sorted = sorted.filter(student => student.preferred_week === sortByPreferredWeek);
        //     }
        
        //     if (sortByLocation) {
        //         sorted = sorted.filter(student => student.location === sortByLocation);
        //     }
        
        //     return sorted;
        // }, [studentData?.results, sortByMode, sortByLanguage, sortByPreferredWeek, sortByLocation]);
        


        const handleSort = async (key, filterType) => {
            if (key === "clear") {
                
                if (filterType === "mode") setSortByMode(null);
                if (filterType === "language") setSortByLanguage(null);
                if (filterType === "preferred_week") setSortByPreferredWeek(null);
                if (filterType === "location") setSortByLocation(null);
                
                return;
            }
        
            if (filterType === "mode") setSortByMode(key);
            if (filterType === "language") setSortByLanguage(key);
            if (filterType === "preferred_week") setSortByPreferredWeek(key);
            if (filterType === "location") setSortByLocation(key);
        
        };


        const modeMenu = {
            items: [
                { key: "Online", label: <span style={{ color: "red" }}>Online</span> },
                { key: "Offline", label: <span style={{ color: "green" }}>Offline</span> },
                { key: "Hybrid", label: <span style={{ color: "blue" }}>Hybrid</span> },
                { type: "divider" },
                { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
            ],
            onClick: ({ key }) => {
                if (key === "clear") {
                  setSortByMode(""); // clear filter
                } else {
                  setSortByMode(key); // apply mode filter
                }
              },
        };


        const languageMenu = {
            items: [
                { key: "Hindi", label: <span style={{ color: "green" }}>Hindi</span> },
                { key: "English", label: <span style={{ color: "red" }}>English</span> },
                { key: "Both", label: <span style={{ color: "blue" }}>Both</span> },
                { type: "divider" },
                { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
            ],
            onClick: ({ key }) => handleSort(key, "language"),
        };

        const preferredWeekMenu = {
            items: [
                { key: "Weekdays", label: <span style={{ color: "gray" }}>Weekdays</span> },
                { key: "Weekends", label: <span style={{ color: "gray" }}>Weekends</span> },
                { key: "both", label: <span style={{ color: "gray" }}>Both</span> },
                { type: "divider" },
                { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
            ],
            onClick: ({ key }) => handleSort(key, "preferred_week"),
        };

        const locationMenu = {
            items: [
                { key: "1", label: <span style={{ color: "blue" }}>Saket</span> },
                { key: "2", label: <span style={{ color: "magenta" }}>Laxmi Nagar</span> },
                { key: "3", label: <span style={{ color: "blue" }}>Both</span> },
                { type: "divider" },
                { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
            ],
            onClick: ({ key }) => handleSort(Number(key), "location"),
        };



    return (
        <>
        <div className="w-auto pt-4 px-2 mt-10">
            <StudentCards />
            <div className="relative mt-3 w-full h-full shadow-md sm:rounded-lg border border-gray-50">
            {/* <div className="w-full px-4 py-3 text flex justify-between font-semibold "> */}
                {/* <h1>All Students</h1> */}
                    {/* <div>
                        <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Student +</button>
                    </div> */}
                {/* </div> */}

                <div className="w-full grid grid-cols-3 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 py-4">
                    <div className="grid col-span-1">
                        <div className="flex gap-x-4 h-10 items-center">
                            
                            <div className="lg:hidden mb-2">
                                <select
                                    value={activeTab}
                                    onChange={(e) => handleTabClick(e.target.value)}
                                    className="block w-auto px-4 py-1 text-sm border rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                <option value="">All Students</option>
                                <option value="Temp Block">Temporary Block</option>
                                <option value="Restricted">Restricted</option>
                                </select>
                            </div>

                            <div className="hidden lg:flex">
                                <button
                                    onClick={() => handleTabClick('')}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === '' ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                    All Students
                                </button>
                                <button
                                    onClick={() => handleTabClick('Temp Block')}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === 'Temp Block' ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                    Temporary Block
                                </button>
                                <button
                                    onClick={() => handleTabClick('Restricted')}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === 'Restricted' ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                    Restricted
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-center">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className="relative">
                            <input value={searchTerm} type="text" id="table-search" placeholder="Search for student"
                                onChange={(e) => {
                                    const value = e.target.value.trimStart();
                                    setSearchTerm(value);
                                    setCurrentPage(1);
                                }}
                                className="2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <button onClick={() => setSearchTerm("")}>
                            {searchTerm ? (
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                    </svg>
                                )}
                            </button>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className="h-8 focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5">Add Student +</button>
                    </div>

                </div>


                
                <div className={`overflow-hidden pb-2 relative `}>
                    <div className="w-full h-[38rem] overflow-y-auto rounded-lg pb-2">
                        <table className="w-full text-xs text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                            <tr>
                                <td scope="col" className="p-2">
                                    <div className="flex items-center">
                                        <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"></input>
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </td>
                                <th scope="col" className="px-3 py-3 md:px-2">
                                    s.No
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Enrollment No
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Name
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Phone No
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Email
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Date of Joining
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Courses
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Mode
                                    <Tooltip title="Sort by Mode" placement="top">
                                    <span>
                                        <Dropdown menu={modeMenu} >
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByMode ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Language
                                    <Tooltip title="Sort by Language" placement="top">
                                    <span>
                                        <Dropdown menu={languageMenu} >
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByLanguage ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Preferred Week
                                    <Tooltip title="Sort by Preferred Week" placement="top">
                                    <span>
                                        <Dropdown menu={preferredWeekMenu} >
                                            <Button type="text" icon={<FilterOutlined style={{ color: sortByPreferredWeek ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Location
                                    <Tooltip title="Sort by Location" placement="top">
                                    <span>
                                        <Dropdown menu={locationMenu} >
                                            <Button type="text" icon={<FilterOutlined style={{ color: sortByLocation ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    course Counsellor
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    support Coordinator
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Action
                                </th>
                                
                            </tr>
                        </thead>
                        {/* TO show all students data  */}
                        {(activeTab === '' || activeTab === "Temp Block" || activeTab === "Restricted") && (
                        <tbody>
                        {loading ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>
                        
                        ) : studentData?.results?.length > 0 ? (
                            studentData.results.map((item, index) => (
                            <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50 scroll-smooth">
                                <td scope="col" className="p-2">
                                    <div className="flex items-center">
                                        <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </td>
                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                    {(currentPage - 1) * pageSize + index + 1}
                                </td>
                                {/* <td className="px-3 py-2 md:px-1">
                                    {item.id}
                                </td> */}
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                    {item.enrollment_no}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                    {item.name}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {item.phone}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {item.email}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {new Date(item.date_of_joining).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "2-digit"
                                    })}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                <Avatar.Group
                                        max={{
                                                count: 2,
                                                style: {
                                                    color: "#f56a00",
                                                    backgroundColor: "#fde3cf",
                                                    height: "24px", // Match avatar size
                                                    width: "24px", // Match avatar size
                                            }
                                        }}
                                        >
                                            {item.courses_names?.map((name, index) => (
                                                <Tooltip key={index} title={name} placement="top">
                                                    <Avatar
                                                        size={24}
                                                        style={{ backgroundColor: "#87d068" }}
                                                    >
                                                        {name[0]}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}
                                        </Avatar.Group>
                                </td>


                                <td className="px-3 py-2 md:px-1">
                                <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'Online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                <Tag bordered={false} color={item.language == 'Hindi'? 'green' : item.language == 'English'? 'volcano' : 'blue'}>{item.language}</Tag>
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                        {item.preferred_week}
                                    </Tag>
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    {item.location == "1" ? <Tag bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag bordered={false} color="geekblue">Both</Tag> }
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    {item.course_counsellor_name}
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    {item.support_coordinator_name}
                                </td>
                                
                                <td className="px-3 py-2 md:px-1">
                                    {/* <Switch
                                        size="small"
                                        checkedChildren={<CheckOutlined />}
                                        unCheckedChildren={<CloseOutlined />}
                                        checked={studentStatuses[item.id] || false} // Get correct status per student
                                        onChange={(checked) => handleStudentStatusChange(checked, item.id)}
                                        style={{
                                            backgroundColor: studentStatuses[item.id] ? "#38b000" : "gray", // Change color when checked 38b000
                                        }}
                                    /> */}

                                    <Dropdown
                                        menu={{
                                            items: ["Active", "Inactive", "Temp Block", "Restricted"]
                                                .map((status) => ({
                                                    key: status,
                                                    label: status,
                                                })),
                                            onClick: ({ key }) => handleStudentStatusChange(item.id, key),
                                        }}
                                        >
                                            <a onClick={(e) => e.preventDefault()}>
                                            <Tag color={
                                                (studentStatuses[item.id] || item.status) === "Active" ? "#28a745" :
                                                (studentStatuses[item.id] || item.status) === "Inactive" ? "#6c757d" :
                                                (studentStatuses[item.id] || item.status) === "Temp Block" ? "#ff9100" :
                                                "#ef233c"
                                            }>
                                                {studentStatuses[item.id || item.status]} <span><DownOutlined /></span>
                                            </Tag>
                                        </a>
                                    </Dropdown>
                                </td>

                                <td > <Button 
                                        color="primary" 
                                        variant="filled" 
                                        className="rounded-lg w-auto pl-3 pr-3 py-0 my-1 mr-1"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                            handleEditClick(item);  // Open the form with selected course data
                                            setIsModalOpen(true);   // Open the modal
                                        }}
                                    >
                                        <EditOutlined />
                                    </Button>
                                    <Popconfirm
                                        title="Delete the Student"
                                        description="Are you sure you want to delete this Student?"
                                        onConfirm={() => confirm(item.id)}
                                        onCancel={cancel}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button 
                                            color="danger" 
                                            variant="filled" 
                                            className="rounded-lg w-auto px-3"
                                            onClick={(e) => e.stopPropagation()} // Prevent the click from triggering the Edit button
                                        >
                                            <DeleteOutlined />
                                        </Button>
                                </Popconfirm>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="100%" className="text-center py-4 text-gray-500">
                                <Empty description="No Students found" />
                            </td>
                        </tr>
                    )}
                        </tbody>
                        )}

                        </table>
                    </div>

                {/* <div className="w-full h-14 bg-slate-200"> */}
                <div className="flex justify-center items-center mt-0 py-3 bg-zinc-100">
                    <Pagination
                        current={currentPage}
                        total={studentData?.count || 0}
                        pageSize={pageSize} // example: 10
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}    // hide page size select
                        showQuickJumper={false}    // hide quick jump input
                    />
                    </div>
                {/* </div> */}

                </div>
                
            </div>
            
        <CreateStudentForm isOpen={isModalOpen} selectedStudentData={selectedStudent || {}} onClose={() => setIsModalOpen(false)} />

        </div>  


   </>
    )
}


export default Students;