import { useState } from 'react';
import { Tag, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import InfoPageLoading from '../../../../../Pages/SkeletonLoading.jsx/StudentInfoLoading';
import { useStudentInfo } from './StudentInfoContext';
import { useNavigate } from 'react-router-dom';

const StudentInfo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const { studentDetails, courseInfo, fetchCourseInfo } = useStudentInfo();

    const navigate = useNavigate();


    const handleCourseClick = (course) => {
            if (!course?.id) {
                console.error("Course ID is missing", course);
                return;
            }

            fetchCourseInfo(course.id);
            setSelectedCourse(course);
            setIsModalOpen(true);
        };

        const handleCloseModal = () => {
            setIsModalOpen(false);
            setSelectedCourse(null);
        };

        const handleBatchClick = (batchId) => {            
            if (batchId) {
                const encodedId = btoa(batchId);
                navigate(`/student-info/student-batches/${encodedId}`);
                handleCloseModal();
            }
        };




    return (
        <>
            <div className="w-full h-full pt-0 px-0">
                <>
                    <div className="grid grid-cols-6 gap-x-6">
                        {studentDetails?.studentinfo ? ( 
                            <>
                                <div className="px-2 py-2 col-span-6 w-full h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                                    <div className="w-full h-auto px-1 py-2 text-lg font-semibold flex justify-between">
                                        <p className='ml-0'># {studentDetails?.studentinfo?.enrollment_no}</p>
                                    </div>
    
                                    <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 2xl:text-md md:text-md text-xs px-4 py-4 gap-x-1 gap-y-4">
    
                                        <div className="col-span-1 px-1 py-1 ">
                                            <h1 className='font-serif text-gray-700'>Name</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">{studentDetails?.studentinfo.name}</p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1">
                                            <h1 className='font-serif text-gray-700'>Date of Joining</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {dayjs(studentDetails?.studentinfo?.date_of_joining).format("DD/MM/YYYY")}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-0">
                                            <h1 className='font-serif text-gray-700'>Phone Number</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.phone}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-0">
                                            <h1 className='font-serif text-gray-700'>Email Address</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950 break-words">
                                                {studentDetails?.studentinfo?.email}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-0">
                                            <h1 className='font-serif text-gray-700'>Preferred Week</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.preferred_week}
                                            </p>
                                        </div>
                                        
                                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-0">
                                            <h1 className='font-serif text-gray-700'>Mode</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.mode}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 mt-0">
                                            <h1 className='font-serif text-gray-700'>Language</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.language}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 mt-0">
                                            <h1 className='font-serif text-gray-700'>Course Counsellor</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.course_counsellor}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 mt-0">
                                            <h1 className='font-serif text-gray-700'>Support Coordinator</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.support_coordinator}
                                            </p>
                                        </div>
    
                                        <div className="col-span-1 px-1 py-1 mt-0">
                                            <h1 className='font-serif text-gray-700'>Address</h1>
                                            <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                {studentDetails?.studentinfo?.address || 'Not Available'}
                                            </p>
                                        </div>
    
                                    </div>
                            
                                </div>
                                
                                <div className="px-1 py-4 col-span-6 mt-1 h-auto shadow-md sm:rounded-lg border border-gray-100 darkmode">
                                    <div className="w-full font-semibold">
                                        
                                        <div className="col-span-1 text-lg px-1 py-4">
                                            <h1>Courses</h1>
                                        </div>
    
                                        <div className="col-span-1 leading-8 border">
                                            <table className="w-full text-xs text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-green-200 sticky top-0 z-10">
                                                    <tr>
                                                        <th scope="col" className="px-1 py-2 md:px-1">
                                                            S.No
                                                        </th>
                                                        <th scope="col" className="px-1 py-2 md:px-1">
                                                            Course Name
                                                        </th>
                                                        <th scope="col" className="px-1 py-2 md:px-1">
                                                            Course Status
                                                        </th>
                                                        <th scope="col" className="px-1 py-2 md:px-1">
                                                            Batch Taken
                                                        </th>
                                                        <th scope="col" className="px-1 py-2 md:px-1">
                                                            Books
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
        
                                                    {studentDetails.studentcourse.map((item,index)=>(
                                                        <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50 scroll-smooth cursor-pointer"  onClick={() => handleCourseClick(item)}>
                                                            <td scope="row" className="px-3 py-2 md:px-3 font-medium text-gray-900">
                                                                {index+1}
                                                            </td>
    
                                                            <td className="px-1 py-2 md:px-1">
                                                                {item.course_name}
                                                            </td>
    
                                                            <td className={`px-1 py-2 md:px-1 `}>
                                                                <Tag bordered={false} 
                                                                    color={
                                                                        item.course_status == "Ongoing" ? "green" :
                                                                        item.course_status == "Upcoming" ? "lime" :
                                                                        item.course_status == "Not Started" ? "red" :
                                                                        item.course_status == "Completed" ? "blue" :
                                                                        "gray"
                                                                    }>
                                                                    { item.course_status }
                                                                </Tag>
                                                            </td>
    
                                                            <td className={`px-1 py-2 md:px-1 text-md`}>
                                                                { item.course_taken }
                                                            </td>
                                                            <td className="px-1 py-2 md:px-1 text-md">
                                                                {item.student_book_allotment ? (
                                                                   <span className="flex items-center gap-1 text-green-600">
                                                                        <CheckCircleOutlined className="text-green-500 text-md lg:text-lg md:text-lg 2xl:text-lg" />
                                                                        {dayjs(item.student_book_date).format("DD/MM/YYYY | hh:mm A")}
                                                                    </span>
                                                                ) : (
                                                                "-"
                                                                )}
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
    

                                    {/* Modal for Course Info */}
                                    <Modal
                                        title={<h3 className="text-md font-semibold">Course Details</h3>}
                                        open={isModalOpen}
                                        onCancel={handleCloseModal}
                                        footer={null}
                                        width={800}
                                    >
                                        {courseInfo?.course_info && (
                                            <div className="space-y-2">
                                                {/* Course Info */}
                                                <div className="rounded-lg border shadow-sm p-3 bg-white space-y-2">
                                                    <h2 className="text-md font-sans font-bold">{courseInfo.course_info.course_name}</h2>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                                                        <div><span className="text-gray-600">Course Status: </span><span className="font-semibold">{courseInfo.course_info.status || "N/A"}</span></div>
                                                        <div><span className="text-gray-600">Exam Date: </span><span className="font-semibold">{courseInfo.course_info.student_exam_date || "Not Set"}</span></div>
                                                        <div><span className="text-gray-600">Certificate Issued: </span><span className="font-semibold">{courseInfo.course_info.certificate_issued_at ? "Yes" : "No"}</span></div>
                                                        <div><span className="text-gray-600">Marks: </span><span className="font-semibold">{courseInfo.course_info.marks ?? "Not Available"}</span></div>
                                                    </div>
                                                    <div className="flex gap-1 flex-wrap">
                                                        <span className="px-1 py-0 text-sm bg-green-100 text-green-700 rounded border border-green-300">
                                                            Book Allotted: {courseInfo.course_info.student_book_allotment ? "Yes" : "No"}
                                                        </span>
                                                        <span className="px-1 py-0 text-sm bg-yellow-100 text-yellow-700 rounded border border-yellow-300">
                                                            Old Book: {courseInfo.course_info.student_old_book_allotment ? "Yes" : "No"}
                                                        </span>
                                                    </div>
                                                </div>
            
                                                {/* Batch Info Table */}
                                                {courseInfo?.batches?.length > 0 && (
                                                    <div className="mt-0">
                                                        <h3 className="text-md font-semibold mb-1">Batch Details</h3>
                                                        <div className="overflow-x-auto rounded-lg border">
                                                            <div className="max-h-72 overflow-y-auto">
                                                                <table className="min-w-full text-sm text-center text-gray-700">
                                                                    <thead className="bg-green-100 text-gray-900 text-sm uppercase">
                                                                        <tr>
                                                                            <th className="px-0 py-0 font-medium border">S.NO</th>
                                                                            <th className="px-0 py-0 font-medium border">Batch ID</th>
                                                                            <th className="px-0 py-0 font-medium border">Status</th>
                                                                            <th className="px-0 py-0 font-medium border">Start Date</th>
                                                                            <th className="px-0 py-0 font-medium border">End Date</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {courseInfo.batches.map((batch, index) => (
                                                                            <tr key={index} onClick={() => handleBatchClick(batch.id)} className="bg-white hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out">
                                                                                <td className="px-1 py-1 border">{index + 1}</td>
                                                                                <td className="px-1 py-1 border font-medium">{batch.batch_id}</td>
                                                                                <td className="px-1 py-1 border">
                                                                                    <span className={`px-1 py-1 rounded text-xs ${
                                                                                        batch.status === 'Running'
                                                                                            ? 'bg-green-100 text-green-700'
                                                                                            : batch.status === 'Upcoming'
                                                                                            ? 'bg-lime-100 text-lime-700'
                                                                                            : batch.status === "Hold"
                                                                                            ? "bg-yellow-100 text-yellow-700"
                                                                                            : batch.status === "Completed"
                                                                                            ? "bg-blue-100 text-blue-700"
                                                                                            : 'bg-red-100 text-red-700'
                                                                                    }`}>
                                                                                        {batch.status}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-1 py-1 border text-green-700">{batch.start_date}</td>
                                                                                <td className="px-1 py-1 border text-green-700">{batch.end_date}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Modal>
                                
                            </>
                            ) : (
                                <>
                                    <InfoPageLoading/>
                                </>
                        )} 
                    </div>
                </>
            </div>  
        </>
    )

}

export default StudentInfo;