import React, { useEffect } from 'react';
import { useStudentBatch } from './StudentBatchContext';
import { useParams } from 'react-router-dom';
import InfoPageLoading from '../../../../../Pages/SkeletonLoading.jsx/StudentInfoLoading';
import dayjs from 'dayjs';
import { Flex, Progress, Tag, Empty } from 'antd';



const StudentBatchInfo = () => {
  const { batchId } = useParams();
    const { studentBatchInfo, fetchStudentBatcheInfo } = useStudentBatch();
    
    useEffect(() => {
      if (batchId) {
        try {
            const OriginalbatchId = atob(batchId);
            fetchStudentBatcheInfo(OriginalbatchId);
        } catch (error) {
          console.log("Error Decoding Batch Id", error)
        }
      }
    }, []);


  return (
    <div className="w-full h-full pt-0 px-0 ">
      <div className="grid grid-cols-6 gap-x-6">
                            {studentBatchInfo?.batch ? ( 
                                <>
                                  <div className="px-2 py-2 col-span-6 w-full h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    
                                    {studentBatchInfo?.batch.map((item) => ( 
                                      <div key={item.id}>
                                        <div className="w-full h-auto px-1 py-2 text-lg font-semibold flex justify-between">
                                            <p className='ml-0'># {item.batch_id}</p>
                                        </div>
    
                                        <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 2xl:text-md md:text-md text-xs px-4 py-4 gap-x-1 gap-y-4">
        
                                            <div className="col-span-1 px-1 py-1 ">
                                                <h1 className='font-serif text-gray-700'>Course</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                  {item.course__name}
                                                </p>
                                            </div>
        
                                            <div className="col-span-1 px-1 py-1">
                                                <h1 className='font-serif text-gray-700'>Start Date</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                  {dayjs(item.start_date).format("DD/MM/YYYY")}
                                                </p>
                                            </div>
        
                                            <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-0">
                                                <h1 className='font-serif text-gray-700'>End Date</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                  {dayjs(item.end_date).format("DD/MM/YYYY")}
                                                </p>
                                            </div>
                                            
                                            <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-0">
                                                <h1 className='font-serif text-gray-700'>Mode</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    {item.mode}
                                                </p>
                                            </div>

                                            <div className="col-span-1 px-1 py-1 mt-0">
                                                <h1 className='font-serif text-gray-700'>Language</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    {item.language}
                                                </p>
                                            </div>
        
                                            <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-0">
                                                <h1 className='font-serif text-gray-700'>Preferred Week</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    {item.preferred_week}
                                                </p>
                                            </div>
        
                                            <div className="col-span-1 px-1 py-1 mt-0">
                                                <h1 className='font-serif text-gray-700'>Location</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    {item.location__locality}
                                                </p>
                                            </div>

                                            <div className="col-span-1 px-1 py-1 mt-0">
                                                <h1 className='font-serif text-gray-700'>Trainer</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    {item.trainer__name}
                                                </p>
                                            </div>

                                            <div className="col-span-1 px-1 py-1 mt-0">
                                                <h1 className='font-serif text-gray-700'>Trainer's Weekoff</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    {item.trainer__weekoff}
                                                </p>
                                            </div>

                                            <div className="col-span-1 px-1 py-1 mt-0">
                                                <h1 className='font-serif text-gray-700'>Trainer's Status</h1>
                                                <p className="font-semibold text-[14px] leading-6 2xl:text-[15px] text-gray-950">
                                                    <Tag color='green'>
                                                      {item.trainer__status}
                                                    </Tag>
                                                </p>
                                            </div>

                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                
                                <div className="px-4 py-4 col-span-6 mt-2 h-auto shadow-md sm:rounded-lg border border-gray-50 darkmode">
                                  <div className='w-full grid md:grid-cols-6 2xl:grid-cols-7 gap-2 border-b-2 border-gray-300 pb-4'>
                                  <div className="text-center col-span-3 grid md:grid-cols-2 2xl:grid-cols-3 pb-4 border-b md:border-b-0 md:border-r 2xl:border-r border-gray-300">
                                      <div className='col-span-3'>
                                        <Flex vertical gap="small">
                                          <Progress percent={studentBatchInfo?.overall_percentage} type="dashboard" size={100} />
                                        </Flex>
                                      <h1 className='font-serif font-semibold pt-2'>Batch Attendance</h1>
                                      </div>

                                      <div className='col-span-3'>
                                       <div className='w-auto md:text-xs 2xl:text-[14px]'>
                                       <p className='leading-6'>Overall classes attended - <strong>{studentBatchInfo?.total_present || 0}</strong></p>
                                       <p className='leading-6'>Total Classes not attended - <strong>{studentBatchInfo?.total_absent || 0}</strong></p>
                                       <p className='leading-6'>Total Classes for this batch - <strong>{studentBatchInfo?.total_days || 0}</strong></p>
                                       </div>
                                      </div>
                                    </div>
                                    
                                    <div className='h-[18rem] col-span-3 2xl:col-span-4 overflow-y-scroll border'>
                                      <table className="w-full text-xs text-left text-gray-500 ">
                                        <thead className="text-xs text-gray-700 uppercase bg-green-200 sticky top-0 z-10">
                                          <tr>
                                            <th scope="col" className="px-8 py-2">Date</th>
                                            <th scope="col" className="px-7 py-2 text-end">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {studentBatchInfo?.attendance.length === 0 ? (
                                            <tr>
                                              <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                  <Empty description="No Attendance for this Batch" />
                                              </td>
                                            </tr>
                                            ) : (
                                              studentBatchInfo?.attendance.map((item) => (
                                                <tr key={item.id} className='border-b'>
                                                  <td className="px-8 py-2">{item.date}</td>
                                                  <td className="px-8 py-2 text-end">
                                                    <Tag bordered={false} color={item.attendance === "Present" ? "success" : item.attendance === "Not Scheduled" ? "geekblue" : "error"}>{item.attendance}</Tag>
                                                  </td>
                                                </tr>
                                            )
                                          )) }
                                        
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
    
                                
                                    </>
                             ) : (
                                <>
                                    <InfoPageLoading />
                                </>
                            )} 
                        </div>
    </div>
  );
};

export default StudentBatchInfo;





{/* <div className='w-full flex justify-center border-b-2 border-gray-300 pb-4'>
<div className='text-center'>
  <Flex vertical gap="small">
    <Progress percent="20" type="dashboard" width={100} />
  </Flex>
  <h1 className='font-serif pt-2'>Batch Attendance</h1>
</div>
</div>
<div className="w-full font-semibold">    

<div className="col-span-1 text-lg py-4">
    <h1>Courses</h1>
</div>

<div className="col-span-1 px-0 py-2 leading-8">
    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
        <thead className="text-xs text-gray-700 uppercase bg-green-200 sticky top-0 z-10">
            <tr>
                <th scope="col" className="px-3 py-3 md:px-2">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 md:px-2 text-center">
                  Status
                </th>
            </tr>
        </thead>
        <tbody>

            {studentDetails.studentcourse.map((item,index)=>(
                <tr  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                    </td>

                    <td className="px-3 py-2 md:px-1">
                    </td>

                </tr>
            ))} 
                
        </tbody>
    </table>
    <ul>

    </ul>
</div>

</div> */}