import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useSpecificStudent } from "../Contexts/SpecificStudent";
import { Dropdown, message, Tag, DatePicker, Button, Checkbox, Input, Popconfirm, Tooltip, Popover, Badge, Collapse, Menu, Progress  } from 'antd';
import {  DownOutlined, CheckCircleOutlined, EditOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import CreateStudentForm from "../Students/CreateStudentForm";
import SpecificStudentLogs from "../AllLogs/Student/SpecificStudentLogs";
import SpecificStudentNotes from "./SpecificNotesPage";
import StudentInfoLoading from "../../../Pages/SkeletonLoading.jsx/StudentInfoLoading";
import handleBatchClick, { handleTrainerClick } from "../../Navigations/Navigations";
import useStudentStatusChange, { statusDescription } from "../../Functions/StudentStatusChange";
import { useTagContext } from "../Tags/TagsContext";
import axiosInstance from "../api/api";
import StudentStatusDropdown from "../../Functions/StudentStatusDropdown";
import { useTheme } from "../../Themes/ThemeContext";

const { TextArea } = Input;




const SpecificStudentPage = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topTab, setTopTab] = useState("Info");
    const [activeTab, setActiveTab] = useState("running");
    const [courseTab, setCourseTab] = useState("Course")

    const [selectedStudent, setSelectedStudent] = useState();

    const { studentId } = useParams();
    const { specificStudent, setSpecificStudent, fetchSpecificStudent, sendMarksUpdate } = useSpecificStudent();

    const { studentStatuses, setStudentStatuses, handleStudentStatusChange } = useStudentStatusChange();
    
    const { handleRemoveTag } = useTagContext();
    
    const [certificateData, setCertificateData] = useState({});
    // store student not typed in input field 
    const [studentNote, setStudentNote] = useState("");

    // store issuing popover states issued book confirmation 
    const [confirmingId, setConfirmingId] = useState(null);
    const [pendingCourse, setPendingCourse] = useState(null);

    // for marks
    const [marksData, setMarksData] = useState({});
    const [openPopoverId, setOpenPopoverId] = useState(null);

    const navigate = useNavigate();
    
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleTopTabClick = (tab) => {
        setTopTab(tab);
    };
        const handleCourseTabClick = (tab1) => {
        setCourseTab(tab1)
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

    useEffect(() => {
        // Wait until fetchSpecificStudent sets the data
        const studentData = specificStudent?.All_in_One?.student;

        if (studentData?.id && studentData?.status) {
            setStudentStatuses({ [studentData.id]: studentData.status });
        }
    }, [specificStudent]);

    
    // FUNCTION TO HANDLE EDIT BUTTON CLICK
    const handleEditClick = (student) => {
        setSelectedStudent(student); // Set the selected course data
        setIsModalOpen(true); // Open the modal
    };


    
    const studentDetails = specificStudent?.All_in_One?.student;
    const student_status_notes = specificStudent?.All_in_One?.student_status_notes;
    
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
            const response = await axiosInstance.patch(`/api/student-course/edit/${id}/`, selectesStatus );
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
            const response = await axiosInstance.patch(`/api/generate-certificate/${courseId}/`, 
                { certificate_date: certificateIssueDate } );
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
            const response = await axiosInstance.get(`/api/download-certificate/${courseId}/`, 
                { responseType: "blob"} );
    
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
            const response = await axiosInstance.patch(`/api/student/old_book/${courseId}/`,
                { old_status : isChecked} );
            
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
            const response = await axiosInstance.patch(`/api/student/book/${courseId}/`,
                { Book : isChecked} );
            
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
            const response = await axiosInstance.post(`/api/student-note-create/`,
                { student_id: studentId, note: studentNote } )
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


    // Handle Toggle of student active, inactive, temporary block and restricted 
    const onChangeStatus = (studentId, newStatus, status_note) => {
        handleStudentStatusChange({ studentId, newStatus, status_note });
    };



     const handleMarksUpdate = async (courseId) => {
            const data = marksData[courseId];
            if (!data?.marks || !data?.exam_date) {
              message.warning("Please provide both marks and exam date.");
              return;
            }
          
            await sendMarksUpdate({
              courseId,
              marks: data.marks,
              exam_date: data.exam_date,
            });
          
            setOpenPopoverId(null); // close popover
          };
    
        //   console.log(marksData);
          
          const marksPopoverContent = (item) => (
            <div className="flex flex-col gap-2">
              <DatePicker
                size="small"
                placeholder="Exam date"
                value={marksData[item.id]?.exam_date ? dayjs(marksData[item.id].exam_date) : null}
                onChange={(date) =>
                  setMarksData((prev) => ({
                    ...prev,
                    [item.id]: {
                      ...prev[item.id],
                      exam_date: date ? dayjs(date).format("YYYY-MM-DD") : null,
                    },
                  }))
                }
              />
              <Input
                size="small"
                placeholder="Marks"
                className="rounded-md w-48 h-6 text-sm"
                value={marksData[item.id]?.marks || ""}
                onChange={(e) =>
                  setMarksData((prev) => ({
                    ...prev,
                    [item.id]: {
                      ...prev[item.id],
                      marks: e.target.value,
                    },
                  }))
                }
              />
              <Button
                type="primary"
                size="small"
                onClick={() => handleMarksUpdate(item.id)}
              >
                Submit
              </Button>
            </div>
          );


        // For Progress Bar data in addtendance of stuent
        const overallSummary = specificStudent?.All_in_One?.attendance_summary?.overall_summary;


    return (
        <>
            <div className={`w-auto h-full pt-16 px-4 mt-0 ${theme.bg}`}>
                <div className="relative z-10 inline-block bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                    <button
                        onClick={() => handleTopTabClick("Info")}
                        className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                            ${topTab === "Info" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                    >
                        Info
                    </button> 
                        
                    <Badge count={specificStudent?.All_in_One?.student_logs.length ?? 0} overflowCount={999} size="small" offset={[1, -6]}>
                        <button
                            onClick={() => handleTopTabClick("Logs")}
                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                ${topTab === "Logs" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                        >
                            Logs
                        </button>
                    </Badge>
                    
                    <Badge count={specificStudent?.All_in_One?.student_notes.length ?? 0} overflowCount={999} size="small" offset={[1, -5]}>
                        <button
                            onClick={() => handleTopTabClick("Notes")}
                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                ${topTab === "Notes" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                        >
                            Notes
                        </button>
                    </Badge>
                                
                </div>
                
                    {topTab === 'Info' && (
                    <>
                        <div className="grid grid-cols-6 gap-x-6 mt-1">
                            {studentDetails ? (
                            <>
                                <div className={`px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg ${theme.specificPageBg}`}>
                                    
                                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p># {studentDetails.enrollment_no}</p>

                                            {/* Tags Display */}
                                            {studentDetails.tags_values?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {studentDetails.tags_values.map((tag) => (
                                                <div
                                                    key={tag.id}
                                                    className="relative text-xs font-medium px-2 py-1 rounded-lg"
                                                    style={{
                                                    backgroundColor: tag.tag_color,
                                                    color: "#fff",
                                                    paddingRight: "20px", // space for close icon
                                                    }}
                                                >
                                                    {tag.tag_name}
                                                    
                                                    {/* Cancel Icon */}
                                                    <span
                                                    className="absolute top-0 right-0 mr-1 mt-0 py-1 text-white text-xs cursor-pointer font-bold"
                                                    onClick={async () => {
                                                            await handleRemoveTag([tag.id], studentDetails.id);
                                                        }}
                                                    >
                                                    ×
                                                    </span>
                                                </div>
                                                ))}
                                            </div>
                                            ) : (
                                            <span className="text-xs text-gray-400"></span>
                                            )}
                                        </div>
                                        
                                        <Button  
                                            color="secondary" 
                                            variant="outlined" 
                                            className={`rounded-xl ${theme.bg}`}
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
                                            <p className={`font-bold text-lg ${theme.text}`}>{studentDetails.name}</p>
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
                                            <StudentStatusDropdown
                                                item={studentDetails}
                                                studentStatuses={studentStatuses}
                                                onChangeStatus={onChangeStatus}
                                            />
                                        </div>

                                        <div className="2xl:col-span-4 col-span-2 mt-6">
                                            <div className="">
                                            <label htmlFor="studentNote" className="font-semibold">Add Note</label>
                                            </div>

                                            <div className="flex gap-2 mt-1">
                                            <TextArea name="studentNote" size="small" className={`${theme.bg} rounded-xl border-gray-300 focus:outline-none placeholder:text-gray-400`}
                                            placeholder={
                                                        studentDetails?.notes?.length > 0
                                                            ? `${studentDetails.notes[studentDetails.notes.length - 1]?.note} (by ${studentDetails.notes[studentDetails.notes.length - 1]?.create_by_name})`
                                                            : "Type note here.."
                                                        }
                                                style={{
                                                    minHeight: '50px',
                                                    maxHeight: '150px',
                                                    overflowY: 'auto',
                                                    resize: 'vertical' 
                                                }}
                                                value={studentNote}
                                                onChange={(e) => setStudentNote(e.target.value)}
                                                />
                                            <button onClick={() => handleCreateNote(studentDetails?.id)} className={`h-10 w-16 my-auto py-2 px-4 rounded-xl font-normal border border-blue-200 text-white ${theme.createBtn}`}>
                                                Add
                                            </button>
                                                </div>
                                        </div>

                                        {student_status_notes?.length > 0 && (
                                            <div className="2xl:col-span-2 md:col-span-1 col-span-2 mt-6">
                                                <label htmlFor="studentNote" className="font-semibold">Status Note</label>

                                                {(() => {
                                                const sortedNotes = [...student_status_notes].sort(
                                                    (a, b) => new Date(b.create_at) - new Date(a.create_at)
                                                );
                                                const latest = sortedNotes[0];
                                                const latestText = latest.note || latest.status_note || "No message";
                                                const latestBy = latest.create_by__first_name || "Unknown";
                                                const createAt = latest.create_at || "";

                                                return (
                                                    <Dropdown
                                                        menu={{
                                                        items: sortedNotes.map((item) => ({
                                                            key: item.id,
                                                            label: (
                                                            <div className={`text-sm whitespace-normal break-words`}>
                                                                {(item.status_note || "No message")}{" "}
                                                                <span className="text-gray-400">
                                                                    - by {item.create_by__first_name || "Unknown"}
                                                                    - {dayjs(item.create_at || "").format("DD-MM-YYYY | hh:mm A")}
                                                                </span>
                                                                </div>

                                                            ),
                                                        })),
                                                        }}
                                                        trigger={["click"]}
                                                        placement="bottomLeft"
                                                        overlayClassName="min-w-full max-h-32 overflow-y-auto" // Full-width menu
                                                    >
                                                    <Button type="default" className={`w-full text-left h-12 flex justify-start ${theme.bg}`}>
                                                        {latestText}{" "}
                                                        <span className="text-gray-400">- by {latestBy} - {dayjs(createAt || "").format("DD-MM-YYYY | hh:mm A")}</span>
                                                    </Button>
                                                </Dropdown>
                                                );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`px-4 py-4 col-span-6 mt-2 h-auto shadow-md ${theme.specificPageBg}`}>
                                    <div className="w-auto inline-block bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                                        
                                        <button
                                            onClick={() => handleCourseTabClick("Course")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                                ${courseTab === "Course" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                            Course
                                        </button>
                                        
                                        <button
                                            onClick={() => handleCourseTabClick("Attendance")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                                ${courseTab === "Attendance" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                            Attendance
                                        </button>
                                    </div>

                                        {courseTab === "Course" && (  
                                            <div className="col-span-1 px-0 mt-1 leading-8 bg-white/40 h-auto md:max-h-[22rem] 2xl:max-h-[25rem] overflow-y-auto rounded-xl pb-2">
                                                <table className="w-full text-xs font-normal text-left text-gray-600">
                                                    <thead className="bg-white sticky top-0 z-10">
                                                        <tr className="bg-gray-50/80">
                                                            <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                                                S.No
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Course Name
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Course Status
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Batch Taken
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Old Books
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Books
                                                            </th>
                                                            <th className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Marks
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Issue Certificate
                                                            </th>
                                                            <th className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                                Exam Date
                                                            </th>
                                                            <th scope="col" className="px-3 py-3 md:px-1 md:w-40 text-xs font-medium uppercase">
                                                                Certificate Issue Date
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    
                                                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                                        {specificStudent?.All_in_One?.student_courses.map((item, index) => (                          
                                                            <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                                                                <td scope="row" className="px-3 py-2 md:px-2">
                                                                    {index + 1}
                                                                </td>

                                                                <td className="px-3 py-2 md:px-1 font-medium">
                                                                    {item.course_name} {item.course_certificate_date ? <CheckCircleOutlined className="text-green-500 text-md"/> 
                                                                    : ''}
                                                                </td>

                                                                <td className={`px-3 py-2 md:px-1 font-normal`}>
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

                                                                <td className={`px-3 py-2 md:px-1 font-normal text-lg ${item.course_taken == "0" ? "text-red-500" : "text-green-400"}`}>
                                                                    {item.course_taken}
                                                                </td>

                                                                <td className={`px-3 py-2 md:px-1 font-normal`}>
                                                                    <input type="checkbox"  onChange={(e) => handleIssueOldBook(item.id, e.target.checked, item.course_name)} checked={item.student_old_book_allotment || false}
                                                                        className={`
                                                                            w-4 h-4 rounded-[4px] text-lg cursor-pointer focus:ring-0
                                                                            appearance-none border border-gray-300
                                                                            transition-all duration-200 ease-in-out
                                                                            checked:${theme.activeTab} checked:border-transparent
                                                                            hover:border-gray-400
                                                                        `}
                                                                    />
                                                                </td>

                                                                <td className={`px-3 py-2 md:px-1 font-normal`}>
                                                                    <Popconfirm
                                                                        title="Issue Book"
                                                                        description={`Are you sure you want to issue the book for "${pendingCourse?.course_name}"?`}
                                                                        onConfirm={handleConfirm}
                                                                        onCancel={handleCancel}
                                                                        okText="Yes"
                                                                        cancelText="No"
                                                                        open={confirmingId === item.id}
                                                                    >
                                                                        <input type="checkbox" checked={item.student_book_allotment || false} onClick={(e) => handleCheckboxClick(e, item)}
                                                                            className={`
                                                                                w-4 h-4 rounded-[4px] text-lg cursor-pointer focus:ring-0
                                                                                appearance-none border border-gray-300
                                                                                transition-all duration-200 ease-in-out
                                                                                checked:${theme.activeTab} checked:border-transparent
                                                                                hover:border-gray-400
                                                                            `}
                                                                        />
                                                                    </Popconfirm>
                                                                </td>


                                                                {/* for marks update */}
                                                                <td className="px-3 py-2 md:px-1 align-center">
                                                                    <div className="flex items-center gap-2">
                                                                        {item.student_marks !== null && (
                                                                        <div
                                                                            className="text-sm bg-blue-100 text-blue-800 rounded font-semibold flex items-center justify-center"
                                                                            style={{ height: "25px", minWidth: "40px", padding: "0 12px" }}
                                                                        >
                                                                            {item.student_marks}
                                                                        </div>
                                                                        )}
        
                                                                        {item.course_status === "Completed" ? (
                                                                        <Popover
                                                                            content={marksPopoverContent(item)}
                                                                            title="Update Marks"
                                                                            trigger="click"
                                                                            open={openPopoverId === item.id}
                                                                            onOpenChange={(open) => setOpenPopoverId(open ? item.id : null)}
                                                                        >
                                                                            <Button
                                                                            className="text-xs flex items-center justify-center "
                                                                            style={{ height: "25px", minWidth: item.student_marks !== null ? "40px" : "80px" }}
                                                                            size="small"
                                                                            >
                                                                            {item.student_marks !== null ? <EditOutlined /> : "Update"}
                                                                            </Button>
                                                                        </Popover>
                                                                        ) : (
                                                                        <Button
                                                                            disabled
                                                                            className="bg-gray-300 text-gray-700 text-xs font-medium cursor-not-allowed"
                                                                            style={{ height: "24px", minWidth: "80px" }}
                                                                            size="small"
                                                                        >
                                                                            Update
                                                                        </Button>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td className="px-3 py-2 md:px-1 flex font-normal">
                                                                    <DatePicker name='certificateIssueDate' className='border-gray-300 w-28' size='small'  placeholder="Certificate Date"                    
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
                                                                        className={`mx-1 rounded-full p-2 ${item.course_certificate_date ? "bg-blue-400 text-white" : ""}`}
                                                                        onClick={() => issueCertificate(item.id, certificateData[item.id], item.course_name)}
                                                                    >
                                                                        <Tooltip title={item?.course_certificate_date ? "Certificate Issued" : "Issue Certificate"}>
                                                                            {item.course_certificate_date ? <CheckOutlined className="w-3" /> : <CheckOutlined className="w-3" />}
                                                                        </Tooltip>
                                                                    </Button>
                                                                
                                                                {/* button for download certificate */}
                                                                {item.course_certificate_date && ( // Only show "Download" button if certificate is issued
                                                                    <Tooltip title="Download Certificate" placement="top">
                                                                        <Button 
                                                                            variant="solid"  
                                                                            className="mx-0 p-2 rounded-full bg-blue-400 text-white"
                                                                            onClick={() => downloadCertificate(item.id, item.course_name)}
                                                                        >
                                                                            <DownloadOutlined />
                                                                        </Button>
                                                                    </Tooltip>
                                                                    )}
                                                                </td>

                                                                {/* <td> {item.course_certificate_date ? dayjs(item.course_certificate_date).format("DD-MM-YYYY") : '-'} </td> */}

                                                                <td className="px-3 py-2 md:px-1 font-normal">{item.student_exam_date ? dayjs(item.student_exam_date).format("DD-MM-YYYY") : '-'}</td>
                                                                <td className="px-3 py-2 md:px-1 font-normal">
                                                                    {item.certificate_issued_at ? dayjs(item.certificate_issued_at).format("DD-MM-YYYY | hh:mm A") : "-"}
                                                                </td>

                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    
                                                </table>
                                            </div>
                                        )}

                                        {courseTab === "Attendance" && (
                                            <div className={`h-[25rem] md:max-h-[22rem] 2xl:max-h-[25rem] col-span-4 2xl:col-span-4 overflow-hidden rounded-xl p-2 mt-1 ${theme.bg}`}>
                                                <h2 className={`px-1 py-1 text-lg font-semibold ${theme.text}`}>All Batches Attendance</h2>
                                            <div className="flex gap-4 h-full">
                                                {/* Left: Circular Progress Section */}
                                                <div className="w-1/3 flex flex-col items-center justify-center border-r pr-4">
                                                
                                                <Progress
                                                    type="dashboard"
                                                    percent={parseFloat(overallSummary?.overall_present_percent)}
                                                    strokeColor="#63b1ed"
                                                    format={(percent) => `${percent?.toFixed(2)}%`}
                                                />  
                                                <h2 className="mt-2 font-semibold text-md text-center text-gray-700">
                                                    Overall Attendance
                                                </h2>
                                                <div className="mt-4 text-sm text-gray-800 space-y-1 text-center">
                                                    <p>
                                                    Total Attendance Marked: <span className="font-semibold">{overallSummary?.total_attendance_marked}</span>
                                                    </p>
                                                    <p>
                                                    Total Present: <span className="font-semibold">{overallSummary?.overall_present_percent}</span>
                                                    </p>
                                                    <p>
                                                    Total Absent: <span className="font-semibold">{overallSummary?.overall_absent_percent}</span>
                                                    </p>
                                                </div>
                                                </div>

                                                {/* Right: Attendance Table */}
                                                <div className="w-2/3 overflow-y-auto pb-8 bg-white/40 rounded-xl">
                                                <table className="w-full text-xs font-normal pb-6 text-left text-gray-600">
                                                    <thead className="bg-white sticky top-0 z-10">
                                                    <tr className="bg-gray-50/80">
                                                        <th className="px-4 py-2 text-xs font-medium uppercase">Batch Name</th>
                                                        <th className="px-4 py-2 text-xs font-medium uppercase">Total Marked</th>
                                                        <th className="px-4 py-2 text-xs font-medium uppercase">Total Present</th>
                                                        <th className="px-4 py-2 text-xs font-medium uppercase">Total Absent</th>
                                                        <th className="px-4 py-2 text-xs font-medium uppercase">Latest Attendance</th>
                                                        <th className="px-4 py-2 text-xs font-medium uppercase">Attendance History</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                                    {specificStudent?.All_in_One?.attendance_summary?.batch_wise_summary?.map((batch, index) => (
                                                        <tr key={index} className="border-b hover:bg-white transition-colors scroll-smooth">
                                                        <td className="px-4 py-2 font-medium">{batch.course_name} ({batch.batch_status})</td>
                                                        <td className="px-4 py-2 font-normal">{batch.total_attendance_marked}</td>
                                                        <td className="px-4 py-2 font-normal">{batch.present_percent}</td>
                                                        <td className="px-4 py-2 font-normal">{batch.absent_percent}</td>
                                                        <td className="px-4 py-2 font-medium">
                                                            {batch.latest_status} on {batch.latest_date}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <Dropdown
                                                            overlay={
                                                                <Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                                {batch.attendance_history.map((att, idx) => (
                                                                    <Menu.Item key={idx}>
                                                                    {att.date} — {att.status}
                                                                    </Menu.Item>
                                                                ))}
                                                                </Menu>
                                                            }
                                                            trigger={["hover"]}
                                                            placement="bottomLeft"
                                                            getPopupContainer={(trigger) => trigger.closest("div")}
                                                            >
                                                            <Button
                                                                type="default"
                                                                size="small"
                                                                className="text-blue-600 border-blue-500 w-24"
                                                            >
                                                                View ({batch.attendance_history.length}) <DownOutlined />
                                                            </Button>
                                                            </Dropdown>
                                                        </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                                </div>
                                            </div>
                                            </div>
                                        )}

                                   
                                </div>

                            </>
                            ) : (
                                <>
                                    <StudentInfoLoading/>
                                </>
                            )}
                        </div>
                

                    
                                
                            <div className={`px-0 py-4 h-auto shadow-md mt-2 mb-6 ${theme.specificPageBg}`}>  
                                <div className={`w-full h-auto px-4 py-3 text-lg font-semibold ${theme.text}`}>
                                    <h1>Enrolled Batches</h1>
                                </div>
                                <div className="flex gap-x-4 h-10 px-4">
                                    <div className="bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                                        <button
                                            onClick={() => handleTabClick("running")}
                                            className={` px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                                ${activeTab === "running" ?  `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                                >
                                            Ongoing
                                        </button>

                                        <button
                                            onClick={() => handleTabClick("scheduled")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                                ${activeTab === "scheduled" ?  `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                            >
                                            Scheduled
                                        </button>
                                    
                                        <button
                                            onClick={() => handleTabClick("completed")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                                ${activeTab === "completed" ?  `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                            >
                                            Completed
                                        </button>

                                        <button
                                            onClick={() => handleTabClick("allupcomingbatches")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                                ${activeTab === "allupcomingbatches" ?  `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                            >
                                            Recommended Batches
                                        </button>

                                    
                                        
                                    </div>
                                </div>

                                    <div className="px-4 rounded-xl">
                                        <table className="w-full text-xs font-normal text-left text-gray-600 mt-1 bg-white/40 rounded-xl">
                                            <thead className="bg-white sticky top-0 z-10">
                                                <tr className="bg-gray-50/80">
                                                    <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                                        S.No
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Batch ID
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Batch Time
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Start Date
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        End Date
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        Trainer
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                        course
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
                                                    
                                                </tr>
                                            </thead>
                                                <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                                {Array.isArray(filteredStudentData) && filteredStudentData.length > 0 ? (
                                                    filteredStudentData.map((item, index) => (
                                                    <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                                                        <td scope="row" className="px-3 py-2 md:px-2">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleBatchClick(navigate,item.id)}>
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
                                                            {dayjs(item.end_date).format("DD/MM/YYYY")}
                                                        </td>

                                                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.trainer)}>
                                                            {item.trainer__name}
                                                        </td>
                                                        
                                                        <td className="px-3 py-2 md:px-1 font-medium">
                                                            {item.course__name}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'Online'? 'red' : 'geekblue'}>
                                                                {item.mode}
                                                            </Tag>
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.language === 'Hindi'? 'green' : item.language === 'English'? 'volcano' : 'blue'}>
                                                                {item.language}
                                                            </Tag>
                                                        </td>

                                                        <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue"}>
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