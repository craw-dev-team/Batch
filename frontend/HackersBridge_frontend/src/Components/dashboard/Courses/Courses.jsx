import { useEffect, useState } from "react";
import { Button, message, Popconfirm, Spin, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateCourseForm from "./CreateCourseForm";
import axios from "axios";
import { useCourseForm } from "../Coursecontext/CourseFormContext";
import BASE_URL from "../../../ip/Ip";
import { useAuth } from "../AuthContext/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";


const Courses = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState('tab1');
    const [selectedCourse, setSelectedCourse] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const { coursesData, loading, setCoursesData, fetchCourses } = useCourseForm();
    const { token } = useAuth();
    
    const navigate = useNavigate();

    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

      // Fetch courses after deletion or modal interaction
      useEffect(() => {
            fetchCourses();  // Fetch courses after deletion
            setIsDeleted(false); // Reset deletion flag
     
    }, [isDeleted, selectedCourse, isModalOpen]);
    

    // Function to handle Edit button click
    const handleEditClick = (course) => {
        setSelectedCourse(course); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };

    // Delete Function
    const handleDelete = async (courseId) => {
        if (!courseId) return;

        try {
            const response = await axios.delete(`${BASE_URL}/api/courses/delete/${courseId}/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );

            if (response.status === 204) {
                // Make sure coursesData is an array before filtering
                if (Array.isArray(coursesData)) {
                    setCoursesData(prevCourses => prevCourses.filter(course => course.id !== courseId));
                } else {
                    console.error('coursesData is not an array');
                }
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    // Confirm and Cancel Handlers
    const confirm = (courseId) => {
        handleDelete(courseId); // Call delete function with course ID
        message.success('Course Deleted Successfully');
    };

    const cancel = () => {
        message.error('Course Deletion Cancelled');
    };
   

    // HANDLE NAVIGATE TO SPECIFIC PAGE 
    const handleCourseClick = (courseId) => {
        if (!courseId) return;
        const encodedCourseId = btoa(courseId);
        navigate(`/course/${encodedCourseId}`)
    };

    return (
        <>
       <div className="w-auto pt-4 px-2 mt-16 darkmode">
    <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
    <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
        <h1>All Courses</h1>
            <div>
                <button onClick={() => { setIsModalOpen(true); setSelectedCourse(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Course +</button>
            </div>
        </div>

        <div className="w-full grid grid-cols-4 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 pb-4">
            <div className="grid col-span-2">
                {/* <div className="flex gap-x-4 h-10">
                    <div className="tabs">
                    <button
                        onClick={() => handleTabClick('tab1')}
                        className={` px-4 py-2 text-sm font-semibold rounded-sm transition-colors duration-200 
                            ${activeTab === 'tab1' ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                        >
                    All Courses
                    </button>
                    <button
                        onClick={() => handleTabClick('tab2')}
                        className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors duration-200 
                            ${activeTab === 'tab2' ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                        >
                        Scheduled Courses
                    </button>
                    </div>
                </div> */}
        </div>

        {/* <div className="grid col-span-2 justify-items-end">
            <div className="flex gap-x-6">
            <label htmlFor="table-search" className="sr-only">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="table-search" className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 h-7 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for items"></input>
                </div>
        

            <div className="col-span-1 justify-items-end">
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
            </div>
            </div>
            </div> */}

        

        </div>
        {activeTab === 'tab1' && (
        <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
            <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        s. No
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Course Name
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Course Code
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Duration
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Certification
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
               
            ) : coursesData && Array.isArray(coursesData) && coursesData.length > 0 ? (
                coursesData.map((item, index) => (
                <tr key={item.id} className="bg-white border-b  border-gray-200 hover:bg-gray-50 scroll-smooth">
                    <td className="p-3 px-3 py-2 md:px-1 font-medium text-gray-900">
                        {index + 1}
                    </td>
                    <th scope="row" className="px-3 py-2 md:px-1 font-medium text-gray-900 cursor-pointer" onClick={() => handleCourseClick(item.id)}>
                       {item.name}
                    </th>
                    <td className="px-3 py-2 md:px-1">
                        {item.code}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.duration === 1 ? `${item.duration} Day` : `${item.duration} Days` }
                    </td>
                    <td className="px-3 py-2 md:px-1">
                       {item.certification_body}
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
                        <Empty description="No Courses found"/>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
        {/* <Pagination align="center" defaultCurrent={1} total={50} /> */}
        </div>
        )}
    </div>

<CreateCourseForm isOpen={isModalOpen}  courseData={selectedCourse || {}} onClose={() => setIsModalOpen(false)} />

</div>        
        </>
    )
}

export default Courses;
