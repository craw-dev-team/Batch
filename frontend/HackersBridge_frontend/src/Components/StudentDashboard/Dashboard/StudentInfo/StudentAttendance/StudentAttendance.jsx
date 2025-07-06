import React, { useEffect,useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Progress, Flex, Tooltip } from 'antd';
import { useStudentAttendance } from './StudentAttendanceContext';
import { useNavigate } from 'react-router-dom';

// ChartJS.register(ArcElement, Tooltip, Legend);

const StudentAttendance = () => {
  const { studentAttendance, fetchStudentAttendance } = useStudentAttendance();
  const [activeTab, setActiveTab] = useState('ongoing');

  const navigate = useNavigate();


  useEffect(() => {
    fetchStudentAttendance();
  }, []);



  // Extract overall attendance data
  const overallData = studentAttendance || {};

  const presentCount = overallData.all_present || 0;
  const absentCount = overallData.all_absent || 0;
  const total = overallData.all_total ;

  const presentPercent = total ? Math.round((presentCount / total) * 100) : 0;
  const absentPercent = total ? Math.round((absentCount / total) * 100) : 0;


  const handleBatchClick = (batchId) => {
    if (!batchId) return;    
    const encodedBatchId = btoa(batchId);
    navigate(`/student-info/student-batches/${encodedBatchId}`)
  };



  return (
    <div className="bg-white rounded-xl shadow p-6 w-full mx-auto mt-0.5">
      
      <h2 className="text-lg font-semibold mb-0 text-black">Attendance Record</h2>

      {/* Doughnut Chart */}
      <div className="flex flex-wrap justify-center gap-36 mb-16 mt-2">
        <div className="w-52 h-52 ">
          <h3 className="text-center font-medium text-gray-700 mb-2">Overall Attendance</h3>
          <div className="flex flex-col items-center gap-2">
              <Progress
                size={160}
                type="dashboard"
                percent={presentPercent + absentPercent}
                success={{ percent: presentPercent }}
                strokeColor="#ff4d4f" // Red color for Absent part
                trailColor="#f0f0f0"
                format={() => overallData?.overall_attendance != null 
                  ? `${overallData.overall_attendance}%` 
                  : "0.00%"}
              />
            <div className="text-sm text-gray-700 mt-2 flex gap-4">
              <p><CheckCircleOutlined className='text-green-500' /> Present: {overallData.all_present || 0}</p>
              <p><CloseCircleOutlined className='text-red-500' /> Absent: {overallData.all_absent || 0}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Batch List */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'ongoing' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'
          }`}
        >
          Ongoing Batches
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'completed' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'
          }`}
        >
          Completed Batches
        </button>
      </div>
      <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 h-20rem scrollbar-custom">
      {(activeTab === 'ongoing'
          ? studentAttendance?.batch?.ongoing_batches
          : studentAttendance?.batch?.completed_batches
        )?.map((batch, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full p-4 border rounded-md shadow-sm bg-white transition-shadow duration-300 hover:shadow-md cursor-pointer"
            onClick={() => handleBatchClick(batch.id)}
          >
            <div className="space-y-1">
              <p className="text-sm font-normal text-gray-700">
                <span className="font-semibold">{batch.batch_id}</span>
              </p>
              <p className="text-sm font-normal text-gray-700">
                Date:{' '}
                <span className="font-semibold">
                  {new Date(batch.start_date).toLocaleDateString('en-GB')} -{' '}
                  {new Date(batch.end_date).toLocaleDateString('en-GB')}
                </span>
              </p>
              <p className="text-sm font-normal text-gray-700">
                Time:{' '}
                <span className="font-semibold">
                  {new Date(`1970-01-01T${batch.start_time}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(`1970-01-01T${batch.end_time}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
              <p className="text-sm font-normal text-gray-700">
                Course: <span className="font-semibold">{batch.course_name}</span>
              </p>
            </div>

            {/* Progress Bar */}
            <Flex vertical gap="small">
              <Progress percent={batch?.attendance_summary?.attendance_percentage} type="circle" size={70} />
            </Flex>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;
