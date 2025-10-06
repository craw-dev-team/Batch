import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Select, Empty, Spin, Avatar, Tooltip, Tag, Input, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useSpecificCourse } from "../Contexts/SpecificCourse";
import CreateCourseForm from "../Courses/CreateCourseForm";
import { useCourseForm } from "../Coursecontext/CourseFormContext";
import handleBatchClick, { handleStudentClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";
import { useTheme } from "../../Themes/ThemeContext";




const SpecificCoursePage = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState();
    const [activeTab, setActiveTab] = useState("students");
    // handle selected course to transfer to other course
    // const [selectedCourse, setSelectedCourse] = useState(null); // current course

    const { courseId } = useParams();
    const { specificCourse, loading, fetchSpecificCourse } = useSpecificCourse();
    const navigate = useNavigate();

    const courseinfo = specificCourse?.course_info?.course || {}


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


    useEffect(() => {
        if (courseId) {
            try {
                // Decode the ID before using it
                const originalCourseId = atob(courseId);
                
                // Fetch course data with the decoded ID
                fetchSpecificCourse(originalCourseId);
            } catch (error) {
                console.error("Error decoding Course ID:", error);
            }
        }
    }, [courseId]); 


        // FUNCTION HANDLE EDIT COURSE DETAILS
        const handleEditClick = (course) => {
            setSelectedCourse(course); // Set the selected course data
            setIsModalOpen(true); // Open the modal
        };


    return (
        <>
        <div className={`w-auto h-full pt-16 px-4 mt-0 ${theme.bg}`}>
            <div className="grid">
                    {courseinfo ? (
                    <>
                <div className={`px-4 py-4 col-span-3 h-auto shadow-md sm:rounded-lg ${theme.specificPageBg}`}>
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                        <p># {courseinfo.code}</p>
                        <Button 
                            color="secondary" 
                            variant="outlined" 
                            className={`rounded-xl ${theme.bg}`}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                handleEditClick(courseinfo);  // Open the form with selected course data
                                setIsModalOpen(true);   // Open the modal
                            }}
                            >
                            <EditOutlined />
                        </Button>
                    </div>
                        <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        <div className="col-span-1 px-1 py-1">
                            <h1 >Name</h1>
                            <p className="font-bold text-md">{courseinfo.name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Duration</h1>
                            <p className="font-semibold">{courseinfo.duration} {courseinfo.duration ? "Days" : ''}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Certification</h1>
                            <p className="font-semibold">{courseinfo.certification_body}</p>
                        </div>

                        </div>
                </div>
                
                    </>
                     )  
                     : (
                        <p>Loading Course data...</p>
                    )}
            </div>
           
                    
                <div className={`py-4 px-4 col-span-6 mt-2 h-auto shadow-md ${theme.specificPageBg}`}>
                    
                    <div className="w-full h-auto px-1 py-3 font-semibold">
                        <h1>{activeTab === "students" ? `Students Enrolled in ${courseinfo?.name ?? ""} Course` : `Batches of ${courseinfo?.name ?? ""} Course`}</h1>
                    </div>
                        <div className="flex gap-x-4 justify-between">
                            <div className="bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                            {/* <Badge count={specificCourse?.course_info?.Student_take_by?.length || 0} 
                                    overflowCount={999999}
                                    size="small"
                                    offset={[0, 0]} > */}
                                <button
                                    onClick={() => handleTabClick("students")}
                                    className={`px-4 py-2 textrounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                        ${activeTab === "students" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                    Students
                                </button>
                                {/* </Badge> */}

                                {/* <Badge count={specificCourse?.course_info?.Batch_take_by?.length || 0} 
                                    overflowCount={999999}
                                    size="small"
                                    offset={[0, 0]} > */}
                                <button
                                    onClick={() => handleTabClick("batches")}
                                    className={` px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                    ${activeTab === "batches" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                    Batches
                                </button>
                                {/* </Badge> */}
                                        
                            </div>

                            {/* <div>
                                <Button onClick={() => setIsTransferModalOpen(true)}>Transfer</Button>
                            </div> */}

                        </div>
                        
                        {activeTab === "students" && ( 
                            <div className="overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm">
                                <div className="w-full h-auto md:max-h-[22rem] 2xl:max-h-[25rem] overflow-y-auto rounded-xl pb-2">
                                    <table className="w-full text-xs font-normal text-left text-gray-600">
                                            <thead className="bg-white sticky top-0 z-10">
                                                    <tr className="bg-gray-50/80">
                                                        <th scope="col" className="p-2">
                                                            <div className="flex items-center">
                                                                <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase ">
                                                            S.No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Enrollment No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Student Name
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Phone No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Email
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Date of Joining
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            course
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Mode
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Language
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Preferred Week
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase ">
                                                            Location
                                                        </th>
                                                        
                                                    </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                            {loading.all ? (
                                                <tr>
                                                    <td colSpan="100%" className="text-center py-4">
                                                        <Spin size="large" />
                                                    </td>
                                                </tr>
                                            ) : Array.isArray(specificCourse?.course_info?.Student_take_by) && specificCourse?.course_info?.Student_take_by?.length > 0 ? (
                                                    specificCourse?.course_info?.Student_take_by.map((item, index) => (
                                                    <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                                                        <td scope="col" className="p-2">
                                                            <div className="flex items-center">
                                                                <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                                <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                            </div>
                                                        </td>
                                                        <td scope="row" className="px-3 py-2 md:px-2">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(navigate,item.id)}>
                                                            {item.enrollment_no}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.name}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.phone}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.email}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.date_of_joining}
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
                                                                {item.courses?.map((name, index) => (
                                                                    <Tooltip key={index} title={name} placement="top">
                                                                        <Avatar
                                                                            size={24}
                                                                        className={`${theme.studentCount} text-white`}
                                                                        >
                                                                            {name[0]}
                                                                        </Avatar>
                                                                    </Tooltip>
                                                                ))}
                                                            </Avatar.Group>
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>
                                                                {item.mode}
                                                            </Tag>
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.language === 'Hindi'? 'green' : item.language === 'English'? 'volcano' : 'blue'}>
                                                                {item.language}
                                                            </Tag>
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : "gold" }>
                                                                {item.preferred_week}
                                                            </Tag>
                                                        </td>
                                                            
                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                        {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag className="rounded-xl" bordered={false} color="geekblue">Both</Tag>}
                                                        </td>
                                                    </tr>
                                            ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                        <Empty description="No Batches found" />
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                    </table>
                                </div>

                            </div>
                        )}

                        {activeTab === "batches" && (
                            <div className="overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm">
                            <div className="w-full h-auto md:max-h-[22rem] 2xl:max-h-[25rem] overflow-y-auto rounded-xl pb-2">
                                    <>
                                   <table className="w-full text-xs font-normal text-left text-gray-600">
                                        <thead className="bg-white sticky top-0 z-10">
                                                <tr className="bg-gray-50/80">
                                                    <th scope="col" className="p-2">
                                                        <div className="flex items-center">
                                                            <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                            <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                        </div>
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                                        S.No
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Batch ID
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Start Time
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Start Date
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Course
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Trainer
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Students
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Mode
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Language
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Preferred Week
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Location
                                                    </th>
                                                    
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Status
                                                    </th>
                                                    
                                                </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="100%" className="text-center py-4">
                                                    <Spin size="large" />
                                                </td>
                                            </tr>
                                        ) : Array.isArray(specificCourse?.course_info?.Batch_take_by) && specificCourse?.course_info?.Batch_take_by?.length > 0 ? (
                                                specificCourse?.course_info?.Batch_take_by.map((item, index) => (
                                                <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                                                    <td scope="col" className="p-2">
                                                        <div className="flex items-center">
                                                            <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                            <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                        </div>
                                                    </td>
                                                    <td scope="row" className="px-3 py-2 md:px-2">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleBatchClick(navigate,item.id)}>
                                                        {item.batch_id}
                                                    </td>
                                                    <td className="px-3 py-2 md:px-1">
                                                        {(() => {
                                                            const raw = item.batch_time?.split(" (")[0]; // "10:00:00 - 14:00:00"
                                                            if (!raw) return "N/A";

                                                            const [start, end] = raw.split(" - ");

                                                            const formatTime = (timeStr) =>
                                                            dayjs(`1970-01-01T${timeStr}`).format("hh:mm A");

                                                            return `${formatTime(start)} - ${formatTime(end)}`;
                                                        })()}
                                                    </td>

                                                    <td className="px-3 py-2 md:px-1">
                                                        {dayjs(item.start_date).format("DD/MM/YYYY")}
                                                    </td>
                                                    <td className="px-3 py-2 md:px-1">
                                                        {dayjs(item.end_date).format("DD//MM/YYYY")}
                                                    </td>
                                                    <td className="px-3 py-2 md:px-1">
                                                        {item.trainer}
                                                    </td>
                                                
                                                    <td className="px-3 py-2 md:px-1">
                                                    <Avatar.Group
                                                        max={{
                                                            count: 2,
                                                            style: {
                                                            color: "#f56a00",
                                                            backgroundColor: "#fde3cf",
                                                            height: "24px", // Match avatar size
                                                            width: "24px",  // Match avatar size
                                                            },
                                                        }}
                                                    >
                                                        {item.students?.map((student, index) => (
                                                            <Tooltip key={student.id} title={student.name} placement="top">
                                                            <Avatar
                                                                size={24}
                                                                className={`${theme.studentCount} text-white`}
                                                            >
                                                                {student.name?.charAt(0)}
                                                            </Avatar>
                                                            </Tooltip>
                                                        ))}
                                                    </Avatar.Group>

                                                    </td>
                                                    <td className="px-3 py-2 md:px-1 font-normal">
                                                        <Tag className="rounded-xl" bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>
                                                            {item.mode}
                                                        </Tag>
                                                    </td>
                                                    <td className="px-3 py-2 md:px-1 font-normal">
                                                        <Tag className="rounded-xl" bordered={false} color={item.language === 'Hindi'? 'green' : item.language === 'English'? 'volcano' : 'blue'}>
                                                            {item.language}
                                                        </Tag>
                                                    </td>
                                                    <td className="px-3 py-2 md:px-1 font-normal">
                                                        <Tag className="rounded-xl" bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : "gold" }>
                                                            {item.preferred_week}
                                                        </Tag>
                                                    </td>
                                                        
                                                    <td className="px-3 py-2 md:px-1 font-normal">
                                                    {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag className="rounded-xl" bordered={false} color="geekblue">Both</Tag>}
                                                    </td>

                                                    <td className="px-3 py-2 md:px-1 font-normal">
                                                        <Tag className="rounded-xl" bordered={false} color={item.status === "Running" ? "green" : item.status === "Scheduled" ? "lime" : item.status === "Hold" ? "volcano" : item.status === "Completed" ? "geekblue" : "red"  }>
                                                            {item.status}
                                                        </Tag>
                                                    </td>

                                                </tr>
                                        ))
                                        ) : (
                                            <tr>
                                                <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                    <Empty description="No Batches found" />
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                    </>
                            </div>
    
                            </div>
                        )}
                </div>
                <CreateCourseForm isOpen={isModalOpen} selectedCourseData={selectedCourse || {}} onClose={() => setIsModalOpen(false)} />
                <TransferCourse isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
        </div>  
        </>
    )
};


export default SpecificCoursePage;






const TransferCourse = ({ isOpen, onClose }) => {
    if(!isOpen) return null;

    const { courseId } = useParams();

    const { coursesData, fetchCourses } = useCourseForm()
    const { specificCourse, fetchSpecificCourse } = useSpecificCourse();

    const courseinfo = specificCourse?.course_info?.course || {}
  
    useEffect(() => {
        fetchCourses();

        if (courseId) {
            try {
                // Decode the ID before using it
                const originalCourseId = atob(courseId);
                
                // Fetch course data with the decoded ID
                fetchSpecificCourse(originalCourseId);
            } catch (error) {
                console.error("Error decoding Course ID:", error);
            }
        }
    }, []); 


    // HANDLE FORM SUBMIT TRANSFER STUDENTS OF ONE BATCH TO ANOTHER
    const handleFormSubmit = (e) => {
        e.preventDefault();

        try {
            
        } catch (error) {
            console.log(error);
            
        }
    };

    const handleClose = () => {
        onClose(); // Close the modal
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="relative p-2 w-3/6 bg-white rounded-lg shadow-lg">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-0 md:p-0 border-b rounded-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">

                    </h3>
                    <button
                       onClick={() => { handleClose() }}
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>

                {/* Modal Form */}
                <div className="max-h-[700px] overflow-y-auto">
                    <form className="" >
                    <div className="grid gap-4 mb-1 grid-cols-2">
                        
                        {/*  Course Code Selection  */}
                        <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course</label>
                                <Select name="course" className='w-full border-gray-300' size='small' placeholder='Select Course' 
                                    showSearch  // This enables search functionality
                                        
                                    // onChange={(value) => handleChange("course", value)} 
                                    value={courseinfo?.name || []}
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                    }
                                    options={
                                        courseinfo
                                          ? [courseinfo].map(course => ({
                                              value: course.id,
                                              label: `${course.name}`,
                                            }))
                                          : []
                                      }
                                      
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course</label>
                                <Select name="course" className='w-full border-gray-300' size='small' placeholder='Select Course' 
                                    showSearch  // This enables search functionality
                                        
                                    // onChange={(value) => handleChange("course", value)} 
                                    // value={batchFormData.course ? batchFormData.course : []}
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                    }
                                    options={coursesData.map(course => ({
                                        value: course.id,
                                        label: course.name,
                                    }))}
                                />
                            </div>

                    </div>

                    <div className="flex justify-end">

                    </div>
                    </form>
                </div>
            </div>
            </div>
        </>
    )
};

export {TransferCourse};