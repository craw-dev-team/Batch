import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrainerBatches } from './TrainerBatchesContext';
import dayjs from 'dayjs';
import { Progress, Flex, Empty, Select, DatePicker, Switch, Input, message, theme } from 'antd';
import { useSpecificBatch } from '../../../../dashboard/Contexts/SpecificBatch';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../../../Themes/ThemeContext';

const { Option } = Select;

const TrainerBatchesInfo = () => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------

  const { batchId } = useParams();
  const { fetchTrainerBatchesDetails, trainerBatchDetails, markAttendance } = useTrainerBatches();
  const { classLink, setClassLink, handleSaveClassLink } = useSpecificBatch()
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mergedStudents, setMergedStudents] = useState([]);

  useEffect(() => {
    if (batchId && selectedDate) {
      try {
        const decoded = atob(batchId);
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        fetchTrainerBatchesDetails(decoded, formattedDate);

        const latestBatchLink = trainerBatchDetails?.batch_data?.batch_info?.batch_link;
        if (latestBatchLink) setClassLink(latestBatchLink);

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



  // for adding online class link inn a batch 
  const sendClassLink = async (batchId) => {
    const batch_id = atob(batchId);
console.log(batch_id, classLink);

    if (!classLink) return message.warning("Please enter a class link.");

    try {
      const savelink = await handleSaveClassLink(batch_id, classLink);
      console.log(savelink);
      
       setClassLink(savelink?.batch_info?.batch_link || classLink);
    } catch (err) {
      message.error(err?.response?.data?.message || "Error saving link");
    }
  };



  return (
    <>
      {/* Batch Info Section */}
      <div className={`p-4 sm:p-6 shadow-md rounded-xl ${theme.specificPageBg}`}>
        <h1 className="text-lg font-semibold mb-4 sm:mb-6">#{batch?.batch_id}</h1>
        {batch ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Course</p>
              <p className="text-sm font-semibold truncate">{batch.course || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Mode</p>
              <p className="text-sm font-semibold truncate">{batch.mode || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Language</p>
              <p className="text-sm font-semibold truncate">{batch.language || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Start Date</p>
              <p className="text-sm font-semibold truncate">{dayjs(batch.start_date).format('DD/MM/YYYY')}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">End Date</p>
              <p className="text-sm font-semibold truncate">{dayjs(batch.end_date).format('DD/MM/YYYY')}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Start Time</p>
              <p className="text-sm font-semibold truncate">{dayjs(batch.start_time, 'HH:mm:ss').format('hh:mm A')}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">End Time</p>
              <p className="text-sm font-semibold truncate">{dayjs(batch.end_time, 'HH:mm:ss').format('hh:mm A')}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Preferred Week</p>
              <p className="text-sm font-semibold truncate">{batch.preferred_week || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Location</p>
              <p className="text-sm font-semibold truncate">{batch.location || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Student Count</p>
              <p className="text-sm font-semibold truncate">{batch.student_count || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Status</p>
              <p className="text-sm font-semibold truncate">{batch.status || 'N/A'}</p>
            </div>
            <div className="mb-3 flex flex-col sm:block">
              <p className="text-xs sm:text-sm font-serif sm:mb-1">Class Link</p>
              <div className="flex mt-1">
                <Input
                    value={classLink}
                    onChange={(e) => setClassLink(e.target.value)}
                    placeholder="Class Link"
                    className={`px-2 rounded-xl h-7 mr-2 border border-gray-300 focus:ring-0 ${theme.searchBg}}`}
                />
                <CheckCircleOutlined
                    onClick={() => sendClassLink(batchId)}
                    className="mx-1 text-green-500 text-lg cursor-pointer hover:text-green-700"
                />
                </div>
            </div>
          </div>

        ) : (
          <p className="text-gray-500">Loading batch details...</p>
        )}
      </div>

      {/* Attendance Summary */}
      <div className={`px-4 py-4 col-span-6 mt-2 h-auto shadow-md rounded-xl sm:rounded-lg ${theme.specificPageBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Batch Overall Attendance</h2>
        </div>

        <div className="w-full grid md:grid-cols-6 2xl:grid-cols-7 gap-2 border-b-2 border-gray-300 pb-4">
          <div className="text-center md:col-span-2 col-span-4 grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 pb-4 border-b md:border-b-0 md:border-r 2xl:border-r border-gray-300">
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

          <div className="h-[18rem] col-span-4 2xl:col-span-5 overflow-y-scroll bg-white/40 rounded-md">
            <table className="w-full text-xs font-normal text-left h-auto">
              <thead className="text-xs font-normal text-gray-600 uppercase bg-white sticky top-0 z-10">
                <tr className="bg-gray-50/80">
                  <th className="px-2 py-2 break-words whitespace-normal">Enrollment No</th>
                  <th className="px-2 py-2 break-words whitespace-normal">Student Name</th>
                  {/* <th className="px-2 py-2 break-words whitespace-normal">Support</th> */}
                  <th className="px-2 py-2 break-words whitespace-normal">Total Classes</th>
                  <th className="px-2 py-2 break-words whitespace-normal">Present</th>
                  <th className="px-2 py-2 break-words whitespace-normal">Absent</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(trainerBatchDetails?.batch_data?.student_list_overall) &&
                  trainerBatchDetails.batch_data.student_list_overall.length > 0 ? (
                    trainerBatchDetails.batch_data.student_list_overall.map((student, index) => (
                      <tr key={index} className="text-gray-500 text-xs">
                        <td className="px-2 py-2 break-words whitespace-normal">{student.enrollment_no}</td>
                        <td className="px-2 py-2 break-words whitespace-normal">{student.student_name}</td>
                        {/* <td className="px-2 py-2 break-words whitespace-normal">{student.coordinator || 'N/A'}</td> */}
                        <td className="px-2 py-2 break-words whitespace-normal">{student.total_batch_classes}</td>
                        <td className="px-2 py-2 break-words whitespace-normal">{student.total_present}</td>
                        <td className="px-2 py-2 break-words whitespace-normal">{student.total_absent}</td>
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
      <div className={`p-6 mt-2 shadow-md rounded-xl ${theme.specificPageBg}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-sky-600 font-semibold">Mark Attendance</h2>
          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            format="DD/MM/YYYY"
          />
        </div>

        <div className="rounded-md overflow-x-auto bg-white/40">
          <table className="w-full text-xs text-left text-gray-600">
            <thead className="text-xs text-gray-600 uppercase bg-white sticky top-0 z-10">
              <tr  className="bg-gray-50/80">
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
