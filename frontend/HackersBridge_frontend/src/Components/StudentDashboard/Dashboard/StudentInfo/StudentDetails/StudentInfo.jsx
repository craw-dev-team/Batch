import { Tag  } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import InfoPageLoading from '../../../../../Pages/SkeletonLoading.jsx/StudentInfoLoading';
import { useStudentInfo } from './StudentInfoContext';

const StudentInfo = () => {
    const { studentDetails } = useStudentInfo();



    return (
        <>
            <div className="w-full h-full pt-0 px-0">
                {/* <div className="relative z-10">
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
                                 
                </div> */}
                
                    {/* {topTab === 'Info' && ( */}
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
                                        
                                        {/* <div className="col-span-1 px-1 py-1 mt-6">
                                            <h1>Courses</h1>
                                            {student.courses}
                                        </div> */}
    
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
                                                        {/* <th scope="col" className="px-1 py-2 md:px-1 md:w-40">
                                                            Certificate Date
                                                        </th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
        
                                                    {studentDetails.studentcourse.map((item,index)=>(
                                                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
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

                                                            {/* <td className="px-3 py-2 md:px-1 flex">
                                                                { item.course_certificate }
                                                            </td> */}
                                                            {/* <td className="px-3 py-2 md:px-1 flex items-center ">
                                                                { item.certificate_issued_at || "N/A"  }
                                                            </td> */}
    
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