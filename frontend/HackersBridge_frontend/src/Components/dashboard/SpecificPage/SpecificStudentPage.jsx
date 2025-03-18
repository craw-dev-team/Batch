import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useSpecificStudent } from "../Contexts/SpecificStudent";
import { Button, message, Popconfirm,  Avatar, Tag, Tooltip, Switch, Input, Spin, Empty  } from 'antd';



const SpecificStudentPage = () => {
    const { studentId } = useParams();
    const { specificStudent, fetchSpecificStudent } = useSpecificStudent();
    const [activeTab, setActiveTab] = useState("running");
 
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    useEffect(() => {
        if (studentId) {
            try {
                // Decode the ID before using it
                const originalTrainerId = atob(studentId);
                 
                // Fetch trainer data with the decoded ID
                fetchSpecificStudent(originalTrainerId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    },[studentId]);
    
    const studentDetails = specificStudent?.All_in_One?.student;
    
    const filteredStudentData = specificStudent?.All_in_One
    ? activeTab === 'running'
    ? specificStudent?.All_in_One?.student_batch_ongoing
    : activeTab === 'scheduled'
    ? specificStudent?.All_in_One?.student_batch_upcoming
    : activeTab === 'completed'
    ? specificStudent?.All_in_One?.student_batch_completed
    : activeTab === 'allupcomingbatches'
    ? specificStudent?.All_in_One?.all_upcoming_batch
    : []
    :[];    
    

    // WHEN REDIRECTED FROM SPECIFICBATCH/STUDENTS CLICK
    useEffect(() => {
        if (studentId) {
            try {
                // Decode the ID before using it
                const originalTrainerId = atob(studentId);
                
                // Fetch trainer data with the decoded ID
                fetchSpecificStudent(originalTrainerId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    }, [studentId]);


    return (
        <>
        <div className="w-auto h-full pt-20 px-2 mt-0 darkmode">
            <div className="grid grid-cols-6 gap-x-6">
                    {studentDetails ? (
                    <>
                <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <p># {studentDetails.enrollment_no}</p>
                    </div>
                        <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        <div className="col-span-1 px-1 py-1">
                            <h1 >Name</h1>
                            <p className="font-bold text-lg text-blue-500">{studentDetails.name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1">
                            <h1>Date of Joining</h1>
                            <p className="font-semibold">
                            {new Date(studentDetails.date_of_joining).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                            </p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Phone Number</h1>
                            <p className="font-semibold">{studentDetails.phone}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Email Address</h1>
                            <p className="font-semibold">{studentDetails.email}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Preferred Week</h1>
                            <p className="font-semibold">{studentDetails.preferred_week}</p>
                        </div>
                        
                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Mode</h1>
                            <p className="font-semibold">{studentDetails.mode}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>language</h1>
                            <p className="font-semibold">{studentDetails.language}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>Course Counsellor</h1>
                            <p className="font-semibold">{studentDetails.course_counsellor_name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>Support Coordinator</h1>
                            <p className="font-semibold">{studentDetails.support_coordinator_name}</p>
                        </div>

                        </div>
                </div>

                <div className="px-4 py-4 col-span-5 mt-6 h-auto shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full font-semibold">
                        
                        <div className="col-span-1 text-lg px-4 py-4">
                            <h1>Courses</h1>
                        </div>

                        <div className="col-span-1 px-4 py-2 leading-8">
                            <ul>
                            {specificStudent?.All_in_One?.student_courses.map((course, index) => (
                            <li className="flex justify-between" key={index}>{course.course_name} <span className={course.status == 'Ongoing'? 'text-green-400': 'text-gray-500'}>{course.course_status}</span></li>
                            ))}


                            </ul>
                        </div>

                    </div>
                </div>

                
                    </>
                    ) : (
                        <p>Loading student data...</p>
                    )}
            </div>


           
                    
                <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <h1>Batches Joined</h1>
                    </div>
                    <div className="flex gap-x-4 h-10">
                    
                    <div className="tabs">
                        <button
                            onClick={() => handleTabClick("running")}
                            className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "running" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                        Active
                        </button>

                        <button
                            onClick={() => handleTabClick("scheduled")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "scheduled" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Upcoming
                        </button>
                       
                        <button
                            onClick={() => handleTabClick("copleted")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "hold" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            completed
                        </button>

                        <button
                            onClick={() => handleTabClick("allupcomingbatches")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "completed" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            All upcoming batches
                        </button>

                       
                        
                    </div>

                </div>
                        <div className="">
                                <>
                               <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                                    <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                            <tr>
                                                <th scope="col" className="px-3 py-3 md:px-2">
                                                    S.No
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Batch ID
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Batch Time
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Start Date
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    End Date
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    course
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Mode
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Language
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Preferred Week
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Location
                                                </th>
                                                
                                            </tr>
                                    </thead>
                                        <tbody>
                                        {Array.isArray(filteredStudentData) && filteredStudentData.length > 0 ? (
                                            filteredStudentData.map((item, index) => (
                                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-semibold">
                                                    {item.batch_id}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(`1970-01-01T${item.batch_time__start_time}`).toLocaleString("en-US", {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    hour12: true,
                                                    })} 
                                                    <span> - </span>
                                                    {new Date(`1970-01-01T${item.batch_time__end_time}`).toLocaleString("en-US", {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    hour12: true,
                                                    })}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(item.start_date).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(item.end_date).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-semibold">
                                                    {/* <Avatar.Group
                                                        maxCount={2} // Show only 2 avatars initially
                                                        maxStyle={{
                                                            color: "#f56a00",
                                                            backgroundColor: "#fde3cf",
                                                            height: "24px", // Match avatar size
                                                            width: "24px", // Match avatar size
                                                        }}
                                                    >
                                                        {item.course__name
                                                            ? item.course__name.split(", ").map((name, index) => (
                                                                <Tooltip key={index} title={name} placement="top">
                                                                    <Avatar size={24} style={{ backgroundColor: "#87d068" }}>
                                                                        {name[0]}
                                                                    </Avatar>
                                                                </Tooltip>
                                                            ))
                                                            : <span>No Course</span>
                                                        }
                                                    </Avatar.Group> */}
                                                    {item.course__name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.mode}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.language}
                                                </td>

                                                <td className="px-3 py-2 md:px-1">
                                                    {item.preferred_week}
                                                </td>
                                              
                                                <td className="px-3 py-2 md:px-1">
                                                {item.location == '1' ? 'saket' : 'Laxmi Nagar'}
                                                </td>
                                            </tr>
                                          ))
                                        ) : (
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td colSpan="5" className="text-center py-3 text-gray-500">
                                                    No batches found for {activeTab}
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                </table>
                                </>
                        

                        </div>
                </div>
                   
        </div>  
        </>
    )

}

export default SpecificStudentPage;