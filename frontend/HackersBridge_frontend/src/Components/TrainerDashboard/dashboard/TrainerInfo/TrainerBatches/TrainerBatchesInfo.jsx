import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrainerBatches } from './TrainerBatchesContext';
import dayjs from 'dayjs';
import { Progress, Flex, Empty, Select, DatePicker, Switch } from 'antd';

const { Option } = Select;

const TrainerBatchesInfo = () => {
  const { batchId } = useParams();
  const { fetchTrainerBatchesDetails, trainerBatchDetails, markAttendance } = useTrainerBatches();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mergedStudents, setMergedStudents] = useState([]);

  useEffect(() => {
    if (batchId && selectedDate) {
      try {
        const decoded = atob(batchId);
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        fetchTrainerBatchesDetails(decoded, formattedDate);
      } catch (error) {
        console.log('Error decoding batchId', error);
      }
    }
  }, [batchId, selectedDate]);

  useEffect(() => {
    const students = trainerBatchDetails?.batch_data?.student_list_attendance || [];
    const updated = students.map((s) => ({
      ...s,
      student_attendance_status: s.attendance_status || null,
    }));
    setMergedStudents(updated);
  }, [trainerBatchDetails]);

  const batch = trainerBatchDetails?.batch_data?.batch_info;

  const isDateFuture = (date) => {
    const today = dayjs().startOf("day");
    return date && date.startOf("day").isAfter(today);
  };

  return (
    <>
      {/* Batch Info Section */}
      <div className="p-4 sm:p-6 bg-white rounded-md shadow">
        <h1 className="text-lg text-sky-600 font-semibold mb-4 sm:mb-6">#{batch?.batch_id}</h1>
        {batch ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Course</p>
    <p className="text-sm font-semibold text-black truncate">{batch.course || 'N/A'}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Mode</p>
    <p className="text-sm font-semibold text-black truncate">{batch.mode || 'N/A'}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Language</p>
    <p className="text-sm font-semibold text-black truncate">{batch.language || 'N/A'}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Start Date</p>
    <p className="text-sm font-semibold text-black truncate">{dayjs(batch.start_date).format('DD/MM/YYYY')}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">End Date</p>
    <p className="text-sm font-semibold text-black truncate">{dayjs(batch.end_date).format('DD/MM/YYYY')}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Start Time</p>
    <p className="text-sm font-semibold text-black truncate">{dayjs(batch.start_time, 'HH:mm:ss').format('hh:mm A')}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">End Time</p>
    <p className="text-sm font-semibold text-black truncate">{dayjs(batch.end_time, 'HH:mm:ss').format('hh:mm A')}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Preferred Week</p>
    <p className="text-sm font-semibold text-black truncate">{batch.preferred_week || 'N/A'}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Location</p>
    <p className="text-sm font-semibold text-black truncate">{batch.location || 'N/A'}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Student Count</p>
    <p className="text-sm font-semibold text-black truncate">{batch.student_count || 'N/A'}</p>
  </div>
  <div className="mb-3 flex flex-col sm:block">
    <p className="text-xs sm:text-sm font-serif text-gray-600 sm:mb-1">Status</p>
    <p className="text-sm font-semibold text-black truncate">{batch.status || 'N/A'}</p>
  </div>
</div>

        ) : (
          <p className="text-gray-500">Loading batch details...</p>
        )}
      </div>

      {/* Attendance Summary */}
      <div className="px-4 py-4 col-span-6 mt-4 h-auto shadow-md sm:rounded-lg border border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-sky-600 font-semibold">Batch Overall Attendance</h2>
        </div>

        <div className="w-full grid md:grid-cols-6 2xl:grid-cols-7 gap-2 border-b-2 border-gray-300 pb-4">
          <div className="text-center col-span-2 grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 pb-4 border-b md:border-b-0 md:border-r 2xl:border-r border-gray-300">
            <div className="col-span-1">
              <Flex vertical gap="small">
                <Progress
                  percent={parseFloat(trainerBatchDetails?.batch_data?.overall_attendance?.batch_present_students_in_percentage) || 0}
                  type="dashboard"
                  size={100}
                />
              </Flex>
              <h1 className="font-serif font-semibold pt-2">Overall Attendance</h1>
            </div>
            <div className="col-span-1 text-xs 2xl:text-[14px]">
              <p>Total Classes - <strong>{trainerBatchDetails?.batch_data?.overall_attendance?.total_batch_classes || 0}</strong></p>
              <p>Total Students - <strong>{trainerBatchDetails?.batch_data?.overall_attendance?.total_students || 0}</strong></p>
              <p>Present Students - <strong>{trainerBatchDetails?.batch_data?.overall_attendance?.batch_present_students_in_percentage || '0%'}</strong></p>
              <p>Absent Students - <strong>{trainerBatchDetails?.batch_data?.overall_attendance?.batch_absent_students_in_percentage || '0%'}</strong></p>
            </div>
          </div>

          <div className="h-[18rem] col-span-4 2xl:col-span-5 overflow-y-scroll border">
            <table className="w-full table-fixed text-xs text-left text-gray-500 h-auto">
              <thead className="text-xs text-gray-700 uppercase bg-sky-200 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 break-words whitespace-normal w-[X%]">Enrollment No</th>
                  <th className="px-2 py-2 break-words whitespace-normal w-[X%]">Student Name</th>
                  {/* <th className="px-2 py-2 break-words whitespace-normal w-[X%]">Support</th> */}
                  <th className="px-2 py-2 break-words whitespace-normal w-[X%]">Total Classes</th>
                  <th className="px-2 py-2 break-words whitespace-normal w-[X%]">Present</th>
                  <th className="px-2 py-2 break-words whitespace-normal w-[X%]r">Absent</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(trainerBatchDetails?.batch_data?.student_list_overall) &&
                  trainerBatchDetails.batch_data.student_list_overall.length > 0 ? (
                    trainerBatchDetails.batch_data.student_list_overall.map((student, index) => (
                      <tr key={index} className="text-gray-500 text-xs">
                        <td className="px-2 py-2 break-words whitespace-normal w-[X%]">{student.enrollment_no}</td>
                        <td className="px-2 py-2 break-words whitespace-normal w-[X%]">{student.student_name}</td>
                        {/* <td className="px-2 py-2 break-words whitespace-normal w-[X%]">{student.coordinator || 'N/A'}</td> */}
                        <td className="px-2 py-2 break-words whitespace-normal w-[X%]">{student.total_batch_classes}</td>
                        <td className="px-2 py-2 break-words whitespace-normal w-[X%]">{student.total_present}</td>
                        <td className="px-2 py-2 break-words whitespace-normal w-[X%]">{student.total_absent}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">No student data</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark Attendance Section */}
      <div className="p-6 bg-white mt-4 rounded-md shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-sky-600 font-semibold">Mark Attendance</h2>
          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            format="DD/MM/YYYY"
          />
        </div>

        <div className="border rounded">
          <table className="w-full text-xs text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-sky-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">Enrollment No</th>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">Support</th>
                <th className="px-4 py-2 text-center">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {mergedStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    <Empty description="No Student Data" />
                  </td>
                </tr>
              ) : (
                mergedStudents.map((student, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-bold">{student.enrollment_no}</td>
                    <td className="px-4 py-2 font-bold">{student.student_name}</td>
                    <td className="px-4 py-2">{student.coordinator || 'N/A'}</td>
                    <td className="px-4 py-2 text-center">
                      <Switch
                        checked={student.student_attendance_status === 'Present'}
                        checkedChildren="P"
                        unCheckedChildren="A"
                        disabled={isDateFuture(selectedDate)} // 🔒 Disable for future dates
                        onChange={(checked) => {
                          const newStatus = checked ? 'Present' : 'Absent';
                          const studentId = student.student_id;
                          const batchInfoId = trainerBatchDetails?.batch_data?.batch_info?.id;
                          const date = selectedDate?.format('YYYY-MM-DD');

                          markAttendance(studentId, batchInfoId, newStatus, date);

                          setMergedStudents((prevStudents) =>
                            prevStudents.map((s) =>
                              s.student_id === studentId
                                ? { ...s, student_attendance_status: newStatus }
                                : s
                            )
                          );
                        }}
                        style={{
                          backgroundColor:
                            student.student_attendance_status === 'Present' ? '#55a630' : '#f85a3e',
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TrainerBatchesInfo;
