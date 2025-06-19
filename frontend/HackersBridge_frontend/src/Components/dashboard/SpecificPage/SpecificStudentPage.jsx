import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useSpecificStudent } from "../Contexts/SpecificStudent";
import { Dropdown, message, Tag, DatePicker, Button, Checkbox, Input, Popconfirm, Popover  } from 'antd';
import {  DownOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import BASE_URL from "../../../ip/Ip";
import axios from "axios";
import dayjs from "dayjs";
import CreateStudentForm from "../Students/CreateStudentForm";
import { useAuth } from "../AuthContext/AuthContext";
import SpecificStudentLogs from "../AllLogs/Student/SpecificStudentLogs";
import SpecificStudentNotes from "./SpecificNotesPage";
import StudentInfoLoading from "../../../Pages/SkeletonLoading.jsx/StudentInfoLoading";
import handleBatchClick, { handleTrainerClick } from "../Navigations/Navigations";

const { TextArea } = Input;

const SpecificStudentPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topTab, setTopTab] = useState("Info");
    const [selectedStudent, setSelectedStudent] = useState();

    const { studentId } = useParams();
    const { specificStudent, setSpecificStudent, fetchSpecificStudent } = useSpecificStudent();
    const { token } = useAuth();

    const [activeTab, setActiveTab] = useState("running");
    const [certificateData, setCertificateData] = useState({});
    // store student not typed in input field 
    const [studentNote, setStudentNote] = useState("");

    // store issuing popover states issued book confirmation 
    const [confirmingId, setConfirmingId] = useState(null);
    const [pendingCourse, setPendingCourse] = useState(null);

    const navigate = useNavigate();
    
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleTopTabClick = (tab) => {
        setTopTab(tab);
    };
    
    // WHEN REDIRECTED FROM SPECIFICBATCH/STUDENTS CLICK
    useEffect(() => {
        if (studentId) {
            try {
                // Decode the ID before using it
                const originalStudentId = atob(studentId);
                 
                // Fetch trainer data with the decoded ID
                fetchSpecificStudent(originalStudentId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    },[studentId, certificateData, isModalOpen]);

    
    // FUNCTION TO HANDLE EDIT BUTTON CLICK
    const handleEditClick = (student) => {
        setSelectedStudent(student); // Set the selected course data
        setIsModalOpen(true); // Open the modal
    };


    
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



    // HANDLE COURSE STATUS CHANGE INSIDE THE STUDENT INFO PAGE 
    const handleCourseStatusChange = async (id, selectesStatus) => {
        try {
            const response = await axios.patch(`${BASE_URL}/api/student-course/edit/${id}/`, 
                selectesStatus,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );
            message.success(`Status updated to ${selectesStatus.status}`)
            fetchSpecificStudent(atob(studentId))
            // console.log(response);
            
        } catch (error) {
            // console.log(error);
            message.error("Failed to update status")
        }
    };



    // FUNCTION HANDLE ISSUE CERTIFICATE TO STUDENT OF STUDENT'S COMPLETED COURSES
    const issueCertificate = async (courseId, certificateIssueDate, courseName) => {
        
        if (!certificateIssueDate) {
            message.info("Please Select a certificate issue date");
            return;
        };

        try {
            const response = await axios.patch(`${BASE_URL}/api/generate-certificate/${courseId}/`, 
                { certificate_date: certificateIssueDate },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );
            // console.log(response);
            

            if (response.status === 200) {                
                message.success(`Certificate issued successfully for ${courseName}`)
                fetchSpecificStudent(atob(studentId));
                setCertificateData({})

            } else {
                message.error("Error issuing certificate", response?.error.message)
            };

        } catch (error) {
            // console.log("error occured", error);
            message.error("Something went wrong while issuing the certificate.");
        }

    };


    // FUNCTION HANDLE DOWNLOAD CERTIFICATE
    const downloadCertificate = async (courseId, courseName) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/download-certificate/${courseId}/`, 
                { responseType: "blob",
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                    withCredentials : true
                }
        );
    
            if (response.status === 200) {
                // Create a blob from the response data
                const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    
                // Create a URL for the blob
                const url = window.URL.createObjectURL(pdfBlob);
    
                // Create a temporary download link
                const link = document.createElement("a");
                link.href = url;
                link.download = `${courseName}_certificate.pdf`; 
                document.body.appendChild(link);
                link.click();

                // Cleanup
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
    
                message.success("Certificate downloaded successfully");
            } else {
                message.error("Error downloading certificate");
            }
        } catch (error) {
            // console.error("Error occurred while downloading:", error);
            message.error("Error downloading the certificate");
        }
    };
    

    // HANDLE ISSUE BOOKS TO SPECIFIC STUDENT
    const handleIssueOldBook = async (courseId, isChecked, courseName) => {
        if (!courseId) return null;
        
        try {
            const response = await axios.patch(`${BASE_URL}/api/student/old_book/${courseId}/`,
                { old_status : isChecked},
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );
            
        setSpecificStudent(prev => ({
            ...prev,
            All_in_One: {
              ...prev.All_in_One,
              student_courses: prev.All_in_One.student_courses.map(course =>
                course.id === courseId
                  ? { ...course, student_old_book_allotment: isChecked }
                  : course
              ),
            },
          }));

          if (isChecked) {
                message.success(`Old Book alloted Successfully for ${courseName}`)
          } else {
            message.success(`Old Book Unalloted for ${courseName}`)
          }
    
        // console.log("Server response:", response.data);
        } catch (error) {
            message.error('No available books for this course')        
       }
    };
    
    // Handle Old Book Issue To Students For Temporary Use Only, Will be Removed Later 
    const handleIssueBook = async (courseId, isChecked, courseName) => {
        if (!courseId) return null;
        
        try {
            const response = await axios.patch(`${BASE_URL}/api/student/book/${courseId}/`,
                { Book : isChecked},
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );
            
        setSpecificStudent(prev => ({
            ...prev,
            All_in_One: {
              ...prev.All_in_One,
              student_courses: prev.All_in_One.student_courses.map(course =>
                course.id === courseId
                  ? { ...course, student_book_allotment: isChecked }
                  : course
              ),
            },
          }));

          if (isChecked) {
                message.success(`Book alloted Successfully for ${courseName}`)
          } else {
            message.success(`Book Unalloted for ${courseName}`)
          }
    
        // console.log("Server response:", response.data);
        } catch (error) {
            message.error('No available books for this course')
            console.error("Error issuing book:", error);
        
       }
        
    };

    // handle checkbox click
    const handleCheckboxClick = (e, item) => {
        e.preventDefault();

        // If already checked (i.e., unissuing), handle immediately
        if (item.student_book_allotment) {
            handleIssueBook(item.id, false, item.course_name);
        } else {
            // If not checked (i.e., issuing), show confirmation
            setConfirmingId(item.id);
            setPendingCourse(item);
        }
    };

    // handle confirm issue book on Popover
    const handleConfirm = async () => {
        if (!pendingCourse) return;

        await handleIssueBook(
            pendingCourse.id,
            true, // issue the book
            pendingCourse.course_name
        );

        setConfirmingId(null);
        setPendingCourse(null);
    };
    // handle cancel popover 
    const handleCancel = () => {
        setConfirmingId(null);
        setPendingCourse(null);
    };



    // HANDLE CREATE NOTE FOR STUDENT
    const handleCreateNote = async (studentId) => {
        
        try {
            const response = await axios.post(`${BASE_URL}/api/student-note-create/`,
                { student_id: studentId, note: studentNote },
                { headers : {"Content-Type" : "application/json", "Authorization" : `Bearer ${token}` },
                withCredentials : true
            }
            )
            if (response.status >= 200 && response.status <= 204) {
                message.success("Note Added");
                setStudentNote("")
            } else {
                message.success("Note Not Added")
            }
            
        } catch (error) {
            console.log("Error sending note to server ", error);
            
        }
    };


    return (
        <>
            <div className="w-auto h-full pt-14 px-2 mt-0">
                <div className="relative z-10">
                    <button
                        onClick={() => handleTopTabClick("Info")}
                        className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200  
                            ${topTab === "Info" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400'}`}
                    >
                    Info
                    </button> 

                    <button
                        onClick={() => handleTopTabClick("Logs")}
                        className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                            ${topTab === "Logs" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400'}`}
                    >
                    Logs
                    </button>
                    
                    <button
                        onClick={() => handleTopTabClick("Notes")}
                        className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                            ${topTab === "Notes" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400'}`}
                    >
                    Notes
                    </button>
                                
                </div>
                
                    {topTab === 'Info' && (
                        <>
                        <div className="grid grid-cols-6 gap-x-6">
                                {studentDetails ? (
                                <>
                            <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                                
                                <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                                    <p># {studentDetails.enrollment_no}</p>
                                    
                                    <Button  
                                        color="secondary" 
                                        variant="outlined" 
                                        className="rounded-lg"
                                        onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                                handleEditClick(studentDetails);  // Open the form with selected course data
                                                setIsModalOpen(true);   // Open the modal
                                            }}>
                                            <EditOutlined />
                                        </Button>
                                </div>
                                    <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                                    <div className="col-span-1 px-1 py-1">
                                        <h1 >Name</h1>
                                        <p className="font-bold text-lg text-blue-500">{studentDetails.name}</p>
                                    </div>

                                    <div className="col-span-1 px-1 py-1">
                                        <h1>Date of Joining</h1>
                                        <p className="font-semibold">
                                        {dayjs(studentDetails.date_of_joining).format("DD/MM/YYYY")}
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
                                        <h1>Language</h1>
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

                                    <div className="col-span-1 px-1 py-1 mt-6">
                                        <h1>Address</h1>
                                        <p className="font-semibold">{studentDetails.address || "Not Available"}</p>
                                    </div>

                                    {specificStudent?.All_in_One?.student_courses?.length > 0 && (() => {
                                        const allCourses = specificStudent.All_in_One.student_courses;
                                        const completedCourses = allCourses.filter(course => course.course_status === "Completed");

                                        return (
                                            <div className="col-span-1 px-1 py-1 mt-6">
                                                <h1>Courses</h1>
                                                <p  className="font-semibold">{completedCourses.length}/{allCourses.length} completed</p>
                                            </div>
                                        );
                                    })()}

                                     <div className="col-span-1 px-1 py-1 mt-6">
                                        <h1>Status</h1>
                                        <p className="font-semibold">{studentDetails.status || "Not Available"}</p>
                                    </div>

                                    <div className="2xl:col-span-4 col-span-3 mt-6">
                                        <div className="">
                                        <label htmlFor="studentNote" className="font-semibold">Add Note</label>
                                        </div>

                                        <div className="flex gap-4 mt-1">
                                        <TextArea name="studentNote" size="small" className='rounded-lg border-gray-300 hover:border-blue-300 focus:border-blue-200 focus:ring-blue-300 focus:outline-none placeholder:text-gray-400'
                                            placeholder="Type Note here..." 
                                            style={{
                                                minHeight: '50px',
                                                maxHeight: '150px',
                                                overflowY: 'auto',
                                                resize: 'vertical' 
                                            }}
                                            value={studentNote}
                                            onChange={(e) => setStudentNote(e.target.value)}
                                            />
                                        <Button variant="filled" color="blue" onClick={() => handleCreateNote(studentDetails?.id)} className="h-10 w-16 my-auto py-2 px-4 rounded-md font-semibold border border-blue-200">
                                            Add
                                        </Button>
                                            </div>
                                    </div>

                                    </div>
                            </div>

                            <div className="px-4 py-4 col-span-6 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                                <div className="w-full font-semibold">
                                    
                                    <div className="col-span-1 text-lg px-4 py-4">
                                        <h1>Courses</h1>
                                    </div>

                                    <div className="col-span-1 px-0 py-2 leading-8">
                                    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                                                <thead className="text-xs text-gray-700 uppercase bg-green-200 sticky top-0 z-10">
                                                        <tr>
                                                            <th scope="col" className="px-3 py-3 md:px-2">
                                                                S.No
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                                Course Name
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                                Course Status
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                                Batch Taken
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                                Old Books
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                                Books
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                                Issue Certificate
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 md:w-40">
                                                                Certificate Date
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 md:w-40">
                                                                Issued Date
                                                            </th>
                                                        </tr>
                                                </thead>
                                                    <tbody>

                                                    {specificStudent?.All_in_One?.student_courses.map((item, index) => (                          
                                                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                                            <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                                                {index + 1}
                                                            </td>

                                                            <td className="px-3 py-2 md:px-1">
                                                                {item.course_name} {item.course_certificate_date ? <CheckCircleOutlined className="text-green-500 text-md"/> 
                                                                : ''}
                                                            </td>

                                                            <td className={`px-3 py-2 md:px-1 `}>
                                                            <Dropdown
                                                                trigger={["click"]}
                                                                menu={{
                                                                    items: ["Not Started", "Ongoing", "Completed"]
                                                                        .filter(status => item.course_status !== status) // Ensure case consistency
                                                                        .map(status => ({
                                                                            key: status,
                                                                            label: status.replace("_", " "), // Format for readability
                                                                        })),
                                                                    onClick: ({ key }) => handleCourseStatusChange(item.id, { status : key }),
                                                                }}
                                                            >
                                                                <a onClick={(e) => e.preventDefault()}>
                                                                    <Tag
                                                                        className="w-24 text-center"
                                                                        color={
                                                                            item.course_status == "Ongoing" ? "green" :
                                                                            item.course_status == "Upcoming" ? "lime" :
                                                                            item.course_status == "Not Started" ? "red" :
                                                                            item.course_status == "Completed" ? "blue" :
                                                                            "gray"
                                                                        }>
                                                                        {item.course_status.replace("_", " ")} <DownOutlined />
                                                                    </Tag>
                                                                </a>
                                                            </Dropdown>
                                                            </td>

                                                            <td className={`px-3 py-2 md:px-1 text-md ${item.course_taken == "0" ? "text-red-500" : "text-green-400"}`}>
                                                                {item.course_taken}
                                                            </td>

                                                            <td>
                                                                <Checkbox onChange={(e) => handleIssueOldBook(item.id, e.target.checked, item.course_name)} checked={item.student_old_book_allotment || false}></Checkbox>
                                                            </td>

                                                            <td>
                                                                <Popconfirm
                                                                    title="Issue Book"
                                                                    description={`Are you sure you want to issue the book for "${pendingCourse?.course_name}"?`}
                                                                    onConfirm={handleConfirm}
                                                                    onCancel={handleCancel}
                                                                    okText="Yes"
                                                                    cancelText="No"
                                                                    open={confirmingId === item.id}
                                                                >
                                                                    <Checkbox
                                                                    checked={item.student_book_allotment || false}
                                                                    onClick={(e) => handleCheckboxClick(e, item)}
                                                                    />
                                                                </Popconfirm>
                                                            </td>

                                                            <td className="px-3 py-2 md:px-1 flex">
                                                                <DatePicker name='certificateIssueDate' className='border-gray-300' size='small'  placeholder="Certificate issue date"                    
                                                                    disabled={item.course_status !== "Completed"}
                                                                    value={certificateData[item.id] 
                                                                            ? dayjs(certificateData[item.id])  // Show selected date 
                                                                            : item.course_certificate_date 
                                                                                ? dayjs(item.course_certificate_date)  // Show date from server
                                                                                : null
                                                                    }
                                                                    onChange={(date) => {
                                                                        if (!date) return; // Prevent errors if date is cleared
                                                                    
                                                                        setCertificateData((prevState) => ({
                                                                            ...prevState,
                                                                            [item.id]: dayjs(date).format("YYYY-MM-DD"), // Always update state correctly
                                                                        }));
                                                                    }}
                                                                    
                                                                />     
                                                                <Button variant="solid" disabled={item.course_status !== "Completed"}
                                                                    className={`mx-2 text-gray-50 ${item.course_certificate_date ? "bg-lime-600" : "bg-lime-500"}`}
                                                                    onClick={() => issueCertificate(item.id, certificateData[item.id], item.course_name)}
                                                                >{item.course_certificate_date ? "Issued" : "Issue"}</Button>
                                                            
                                                            {/* button for download certificate */}
                                                            {item.course_certificate_date && ( // Only show "Download" button if certificate is issued
                                                                    <Button 
                                                                        variant="solid"  
                                                                        className="mx-2 bg-blue-500 text-white"
                                                                        onClick={() => downloadCertificate(item.id, item.course_name)}
                                                                    >
                                                                        Download
                                                                    </Button>
                                                                )}
                                                            </td>

                                                            <td> {item.course_certificate_date || 'N/A'} </td>

                                                            <td>
                                                                {item.certificate_issued_at
                                                                    ? `${new Date(item.certificate_issued_at).toISOString().split("T")[0]} | ${new Date(item.certificate_issued_at).toTimeString().split(" ")[0]}`
                                                                    : "N/A"}
                                                            </td>

                                                        </tr>
                                                    ))}
                                                    </tbody>
                                            </table>
                                        <ul>

                                        </ul>
                                    </div>

                                </div>
                            </div>

                            
                                </>
                                ) : (
                                    <>
                                        <StudentInfoLoading/>
                                    </>
                                )}
                        </div>
                

                    
                                
                            <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                                
                                <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                                    <h1>Enrolled Batches</h1>
                                </div>
                                <div className="flex gap-x-4 h-10">
                                
                                <div className="tabs">
                                    <button
                                        onClick={() => handleTabClick("running")}
                                        className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                            ${activeTab === "running" ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                            >
                                        Ongoing
                                    </button>

                                    <button
                                        onClick={() => handleTabClick("scheduled")}
                                        className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                            ${activeTab === "scheduled" ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                        Scheduled
                                    </button>
                                
                                    <button
                                        onClick={() => handleTabClick("completed")}
                                        className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                            ${activeTab === "completed" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                        Completed
                                    </button>

                                    <button
                                        onClick={() => handleTabClick("allupcomingbatches")}
                                        className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                            ${activeTab === "allupcomingbatches" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                        Recommended Batches
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
                                                                Trainer
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
                                                            <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleBatchClick(navigate,item.id)}>
                                                                {item.batch_id}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {dayjs(`1970-01-01T${item.batch_time__start_time}`).format("hh:mm A")} 
                                                                <span> - </span>
                                                                {dayjs(`1970-01-01T${item.batch_time__end_time}`).format("hh:mm A")}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {dayjs(item.start_date).format("DD/MM/YYYY")}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {dayjs(item.end_date).format("dd/MM/YYYY")}
                                                            </td>

                                                            <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(navigate,item.trainer)}>
                                                                {item.trainer__name}
                                                            </td>
                                                            
                                                            <td className="px-3 py-2 md:px-1 font-semibold">
                                                                {item.course__name}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'Online'? 'red' : 'geekblue'}>
                                                                    {item.mode}
                                                                </Tag>
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                <Tag bordered={false} color={item.language === 'Hindi'? 'green' : item.language === 'English'? 'volcano' : 'blue'}>
                                                                    {item.language}
                                                                </Tag>
                                                            </td>

                                                            <td className="px-3 py-2 md:px-1">
                                                                <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue"}>
                                                                    {item.preferred_week}
                                                                </Tag>
                                                            </td>
                                                        
                                                            <td className="px-3 py-2 md:px-1">
                                                            {item.location == '1' ? <Tag bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag bordered={false} color="geekblue">Both</Tag>}
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
                            </>
                    )}

                    {topTab === "Logs" && (
                        <>
                            <SpecificStudentLogs />
                        </>
                    )}

                    {topTab === "Notes" && (
                        <>
                            <SpecificStudentNotes />
                        </>
                    )}

                    <CreateStudentForm isOpen={isModalOpen} selectedStudentData={selectedStudent || {}} onClose={() => setIsModalOpen(false)} />

            </div>  
        </>
    )

}

export default SpecificStudentPage;