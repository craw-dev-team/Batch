import React, { useEffect, useState } from 'react';
import { Card, Tag, Empty, Popconfirm, message } from 'antd';
import { CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import crawlogo from '../../../../../assets/images/crawlogo.png'
import { useStudentBatch } from './StudentBatchContext';
import { useRequestBatch } from './RequestBatch/RequestBatchContext';

const StudentRecommendedBatches = () => {
  // const [searchTerm, setSearchTerm] = useState('');
  const { studentRecommendedBatch, fetchStudentRecommendedBatches } = useStudentBatch();

  const { loading, handleRequestBatchById } = useRequestBatch();
    


  useEffect(() => {
    fetchStudentRecommendedBatches();
  }, []); 


     // Confirm and Cancel Handlers
     const confirm = (batchId) => {
      handleRequestBatchById(batchId); // Call delete function with course ID
    };

    const cancel = () => {
        message.error('Batch Request Cancelled');
    };



  return (
    <div className="p-1 col-span-6 w-full h-screen shadow-md sm:rounded-lg border border-gray-50 bg-white">

      <div className="flex justify-between items-center p-2">
        <h1 className="text-lg font-semibold">Recommended Batches For You</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-2">
        {studentRecommendedBatch?.all_upcoming_batch.length > 0 ? (
          studentRecommendedBatch?.all_upcoming_batch.map((batch) => (
            <Card
              key={batch.id}
              title={
                    <div className="w-full flex justify-between">
                      <span className="text-sm font-semibold">{batch.course__name}</span>
                      <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />
                    </div>
                    }
              className="min-h-[10rem] transition-shadow duration-300 shadow-sm hover:shadow-md hover:scale-100 w-full"
              styles={{
                body: { padding: 0, width: "100%"},
                header: {
                  paddingLeft: 14,
                  paddingRight: 14,
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              }}    
            >
              <div className="w-full flex flex-col items-start justify-start text-left px-[14px] py-2 leading-5">      
                <p className="mb-1 w-full">
                  <FieldTimeOutlined className='text-gray-400 mr-1'/>
                    {dayjs(batch.batch_time__start_time, "HH:mm:ss").format("hh:mm A")} -{" "}
                    {dayjs(batch.batch_time__end_time, "HH:mm:ss").format("hh:mm A")}
                </p>
                        
                <p className="mb-1 w-full">
                  <CalendarOutlined className='text-gray-400 mr-1'/>
                    {dayjs(batch.start_date).format("DD/MM/YYYY")} -{" "}
                    {dayjs(batch.end_date).format("DD/MM/YYYY")}
                </p>

                  <div className='flex justify-between mt-3 w-full'>
                    <p className=''>
                      <Tag bordered={true} color={batch.mode === "Offline" ? "green" : batch.mode === "Online" ? "red" : "geekblue"}>
                        {batch.mode}
                      </Tag>

                      <Tag bordered={true} color={batch.language === "Hindi" ? "green" : batch.language === "English" ? "volcano" : "blue"}>
                        {batch.language}
                      </Tag>

                      <Tag bordered={true} color={batch.preferred_week === "Weekdays" ? "cyan" : batch.preferred_week === "Weekends" ? "gold" : "geekblue"}>
                        {batch.preferred_week}
                      </Tag>

                    </p>
                      {batch.request_status === "Approved" || batch.request_status === "Cancelled" ? (
                        <Tag color={batch.request_status === "Approved" ? "#38b000" : "#ef233c"}>
                          <p>{batch.request_status || "Request"}</p>
                        </Tag>
                      ) : (
                        <Popconfirm
                            title="Send Batch Request"
                            description="Are you sure you want to enroll in this Batch?"
                            onConfirm={() => confirm(batch.batch_id)}
                            onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                        >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-0.5 text-white rounded-md border hover:bg-[#3a6783] ${
                            batch.request_status === "Pending"
                              ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                              : "bg-[#457b9d]"
                          }`}
                          disabled={batch.request_status === "Pending" && loading}
                        >
                          {batch.request_status || "Request"}
                        </button>
                        </Popconfirm>
                      )}

                  </div>
              </div>
            </Card>
          ))
        ) : (
              <div className="w-full col-span-full flex justify-center items-center min-h-[100px]">
                <Empty description="No Batches Found" />
              </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecommendedBatches;
