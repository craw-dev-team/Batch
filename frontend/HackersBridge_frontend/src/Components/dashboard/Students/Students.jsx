import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateStudentForm from "./CreateStudentForm";
import axios from "axios";
import { Button, message, Popconfirm,  Avatar, Tag, Tooltip, Switch, Input, Spin, Empty  } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import BASE_URL from "../../../ip/Ip";
import { useSpecificStudent } from "../Contexts/SpecificStudent";
import { useStudentForm } from "../StudentContext/StudentFormContext";
import StudentCards from "../SpecificPage/StudentCard";

const { Search } = Input;


const Students = () => {
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [activeTab, setActiveTab] = useState('tab1');
    const [selectedStudent, setSelectedStudent] = useState()
    const [isDeleted, setIsDeleted] = useState(false)
    const [studentStatuses, setStudentStatuses] = useState({}); // Store status per trainer
    const [searchTerm, setSearchTerm] = useState("");

    const { studentData, loading, setLoading, setStudentData, fetchStudents } = useStudentForm();

    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 20;


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    
       // Fetch students after deletion or modal interaction
          useEffect(() => {
            fetchStudents();  // Fetch courses after deletion
            setIsDeleted(false); // Reset deletion flag
   
            
            if (studentData) {
                // Ensure trainerData.all_data.trainers exists and is an array
                const studentssArray = Array.isArray(studentData)
                    ? studentData
                    : [];
    
                // Set a timeout to wait 2 seconds before initializing statuses
                const timer = setTimeout(() => {
                    const initialStatuses = {};
                    studentssArray.forEach((student) => {
                        initialStatuses[student.id] = student.status === "Active"; 
                    });
    
                    setStudentStatuses(initialStatuses); 
                }, 100);
    
                // Cleanup function to clear the timer if the component unmounts
                return () => clearTimeout(timer);
            };

        // }, [isDeleted, selectedStudent, isModalOpen, studentData]);
        }, [studentData, isModalOpen ]);
    

   // Function to handle Edit button click
    const handleEditClick = (student) => {
        setSelectedStudent(student); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };

    
   // Delete Function
   const handleDelete = async (studentId) => {
    if (!studentId) return;

    try {
        const response = await axios.delete(`${BASE_URL}/api/students/delete/${studentId}/`);

        if (response.status === 204) {
            // Make sure coursesData is an array before filtering
            if (Array.isArray(studentData)) {
                setStudentData(prevStudents => prevStudents.filter(student => student.id !== studentId));
            } else {
                console.error('coursesData is not an array');
            }
        }
    } catch (error) {
        setLoading(false);
    
        if (error.response) {
            console.error("Server Error Response:", error.response.data);
    
            // Extract error messages and show each one separately
            Object.entries(error.response.data).forEach(([key, value]) => {
                value.forEach((msg) => {
                    message.error(`${msg}`);
                });
            });
        } else if (error.request) {
            console.error("No Response from Server:", error.request);
            message.error("No response from server. Please check your internet connection.");
        } else {
            console.error("Error Message:", error.message);
            message.error("An unexpected error occurred.");
        }
    }       
};

    // Confirm and Cancel Handlers for delete button
    const confirm = (studentId) => {
        handleDelete(studentId); // Call delete function with course ID
        message.success('Course Deleted Successfully');
    };

    const cancel = () => {
        message.error('Course Deletion Cancelled');
    };


     // Handle Toggle of trainer active and inactive 
     const handleToggle = async (checked, studentId) => {
        const newStatus = checked ? "Active" : "Inactive";
        
        //  Optimistically update UI before API call
        setStudentStatuses((prev) => ({ ...prev, [studentId]: checked }));
    
        try {
            await axios.put(`${BASE_URL}/api/students/edit/${studentId}/`, { status: newStatus });
            message.success(`Student status updated to ${newStatus}`);
        } catch (error) {
            message.error("Failed to update status");
            //  Revert UI if API fails
            setStudentStatuses((prev) => ({ ...prev, [studentId]: !checked }));
        }
    };


    const handleTrainerClick =  async (studentId) => {
        if (!studentId) return;
        const encodedTrainerId = btoa(studentId);        
        navigate(`/students/${encodedTrainerId}`);
    };


      // Filter students based on the search term (searches by name)
      const filteredStudents = Array.isArray(studentData)
        ? studentData.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.phone.toLowerCase().includes(searchTerm.toLowerCase()) || 
            student.enrollment_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.support_coordinator_name.toLowerCase().includes(searchTerm.toLowerCase()) 
            )
        : [];


                // Ensure currentPage resets to 1 when search term changes
useEffect(() => {
    setCurrentPage(1);
}, [searchTerm]);

// Calculate the total pages based on the filtered students
const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

// Get students for the current page (AFTER SEARCH FILTERING)
const indexOfLastStudent = currentPage * studentsPerPage;
const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);


    return (
        <>
<div className="w-auto pt-4 px-2 mt-16 darkmode">
    <StudentCards />
    <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
    <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
        <h1>All Students</h1>
            <div>
                <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Student +</button>
            </div>
        </div>

        <div className="w-full grid grid-cols-4 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 pb-4">
            <div className="grid col-span-2">
                <div className="flex gap-x-4 h-10">
                    
                <div className="tabs">
            <button
                onClick={() => handleTabClick('tab1')}
                className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                    ${activeTab === 'tab1' ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                >
            Students
            </button>
            {/* <button
                onClick={() => handleTabClick('tab2')}
                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                    ${activeTab === 'tab2' ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                >
                Filter based on course
            </button> */}
        </div>

                </div>
            </div>

        <div className="grid col-span-2 justify-items-end">
            <div className="flex gap-x-6">
            <label htmlFor="table-search" className="sr-only">Search</label>
                <div className="relative">
                    <input onChange={(e) => setSearchTerm(e.target.value.trim())} value={searchTerm} type="text" id="table-search" placeholder="Search for items"
                        className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 h-7 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                       <button onClick={() => setSearchTerm("")}>
                       {searchTerm ? (
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                            </svg>
                        )}
                       </button>
                    </div>
                </div>

        

            {/* <div className="col-span-1 justify-items-end">
                <button id="dropdownRadioButton" data-dropdown-toggle="dropdownRadio" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                        </svg>
                    Last 30 days
                    <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                    </svg>
                </button>
            
                <div id="dropdownRadio" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600" data-popper-reference-hidden="" data-popper-escaped="" data-popper-placement="top" style={{position: 'absolute', inset: 'auto auto 0px 0px', margin: '0px', transform: 'translate3d(522.5px, 3847.5px, 0px)'}}>
                    <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioButton">
                        <li>
                            <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                <input id="filter-radio-example-1" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                <label htmlFor="filter-radio-example-1" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last day</label>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                <input checked="" id="filter-radio-example-2" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                <label htmlFor="filter-radio-example-2" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last 7 days</label>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                <input id="filter-radio-example-3" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                <label htmlFor="filter-radio-example-3" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last 30 days</label>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                <input id="filter-radio-example-4" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                <label htmlFor="filter-radio-example-4" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last month</label>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                <input id="filter-radio-example-5" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                <label htmlFor="filter-radio-example-5" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last year</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div> */}
            </div>
            </div>

        

        </div>
        {activeTab === 'tab1' && (
        <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
            <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
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
                        Language
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Mode
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Preferred Week
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Location
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
            <tbody>
            {loading ? (
                    <tr>
                        <td colSpan="100%" className="text-center py-4">
                            <Spin size="large" />
                        </td>
                    </tr>
               
            ) : currentStudents.length > 0 ? (
                currentStudents.map((item, index) => (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                        {indexOfFirstStudent + index + 1}
                    </td>
                    {/* <td className="px-3 py-2 md:px-1">
                        {item.id}
                    </td> */}
                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.id)}>
                        {item.enrollment_no}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.id)}>
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
                                maxCount={2} // Show only 2 avatars initially
                                maxStyle={{
                                    color: "#f56a00",
                                    backgroundColor: "#fde3cf",
                                    height: "24px", // Match avatar size
                                    width: "24px", // Match avatar size
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
                    <Tag bordered={false} color={item.language == 'hindi'? 'green' : item.language == 'english'? 'volcano' : 'blue'}>{item.language}</Tag>
                    </td>
                    <td className="px-3 py-2 md:px-1">
                    <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>

                    </td>
                    <td className="px-3 py-2 md:px-1">
                        <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                            {item.preferred_week}
                        </Tag>
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.location == '1' ? <Tag color="blue">Saket</Tag> : <Tag color="magenta">Laxmi Nagar</Tag>}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.course_counsellor_name}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.support_coordinator_name}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        <Switch
                            size="small"
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            checked={studentStatuses[item.id] || false} // Get correct status per trainer
                            onChange={(checked) => handleToggle(checked, item.id)}
                            style={{
                                backgroundColor: studentStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                              }}
                        />
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
                            title="Delete the Course"
                            description="Are you sure you want to delete this course?"
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
            </table>
        </div>

        <div className="w-full h-8 bg-slate-200">
        <div className="flex justify-center items-center mt-4">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="px-4 py-1 mx-3 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                Previous
            </button>

            <span className="text-gray-700">Page {currentPage} of {totalPages || 1}</span>

            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-1 mx-3 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>
        </div>

        </div>
        )}
    </div>
    
<CreateStudentForm isOpen={isModalOpen} selectedStudentData={selectedStudent || {}} onClose={() => setIsModalOpen(false)} />

</div>  


   </>
    )
}


export default Students;