// import React, { useEffect } from 'react';
// import { useTrainerInfo } from './TrainerInfoContext';
// import { Tag } from 'antd';
// import dayjs from 'dayjs';

// const TrainerInfo = () => {
//   const { fetchTrainerDetails, trainerDetails } = useTrainerInfo();

//   useEffect(() => {
//     fetchTrainerDetails();
//   }, []);

//   const trainer = trainerDetails?.trainerinfo;
//   const courses = trainerDetails?.trainercourses || [];

//   return (
//     <div className="w-full h-full">
//       <div className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-4">
//         {trainer ? (
//           <>
//             {/* Trainer Info Section */}
//             <div className="px-2 py-2 col-span-6 w-full h-[25rem] shadow-md sm:rounded-lg border border-gray-50 bg-white">
//               <div className="w-full h-auto px-1 py-2 text-lg font-semibold flex justify-between">
//                 <p className="ml-0 text-sky-600"># {trainer?.trainer_id}</p>
//               </div>
//               <div className="grid 2xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 text-xs px-4 py-4 gap-x-1 gap-y-6">
//                 {[
//                   { label: 'Name', value: trainer.name },
//                   { label: 'Date of Joining', value: dayjs(trainer.date_of_joining).format  ('DD/MM/YYYY') },
//                   { label: 'Phone Number', value: trainer.phone },
//                   { label: 'Email Address', value: trainer.email },
//                   { label: 'Week Off', value: trainer.week_off },
//                   { label: 'Location', value: trainer.location },
//                   { label: 'Experience', value: trainer.experience },
//                   { label: 'Team Leader', value: trainer.team_leader || 'Mohit Yadav' },
//                   { label: 'Leave Status', value: trainer.leave_status || 'On Duty' },
//                   { label: 'Coordinator', value: trainer.coordinator },
//                 ].map((item, i) => (
//                   <div key={i} className="col-span-1 px-1 py-1">
//                     <h1 className="font-serif text-gray-700">{item.label}</h1>
//                     <p className="font-semibold text-[14px] leading-6">{item.value}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Trainer Courses Section */}
//             <div className="px-1 py-4 col-span-6 mt-1 h-auto shadow-md sm:rounded-lg border bg-white border-gray-100">
//               <div className="w-full font-semibold">
//                 <div className="col-span-1 text-lg px-1 py-4">
//                   <h1>Courses</h1>
//                 </div>

//                 <div className="col-span-1 leading-8 border">
//                   <table className="w-full text-xs text-left text-gray-500">
//                     <thead className="text-xs text-gray-700 uppercase bg-sky-200 sticky top-0 z-10">
//                       <tr>
//                         <th className="px-1 py-2">S.No</th>
//                         <th className="px-1 py-2">Course Name</th>
//                         <th className="px-1 py-2">Batch Count</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {courses.map((item, index) => (
//                         <tr key={item.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
//                           <td className="px-3 py-2">{index + 1}</td>
//                           <td className="px-1 py-2">{item.course_name}</td>
//                           <td className="px-1 py-2">
//                             <Tag color={item.batch_count > 0 ? 'blue' : 'default'}>
//                               {item.batch_count}
//                             </Tag>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="col-span-6 text-center text-gray-500">Loading trainer info...</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TrainerInfo;




import React, { useState, useEffect } from 'react';
import { useTrainerInfo } from './TrainerInfoContext';
import { Tag, Modal, theme } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../dashboard/Notification/NotificationContext';
import { useTheme } from '../../../../Themes/ThemeContext';

const TrainerInfo = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

  const { fetchTrainerDetails, trainerDetails } = useTrainerInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const {fetchNotification, notification} = useNotification();

  const navigate = useNavigate();

  useEffect(()=>{
    fetchNotification();
  },[]);


  useEffect(() => {
    fetchTrainerDetails();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };


  const handleCourseClick = (course) => {

    if (!course?.id) {
            console.error("Course ID is missing", course);
            return;
        }
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleBatchClick = (batchId) => {
    if (batchId) {
      const encodedId = btoa(batchId);
      navigate(`/trainer-info/trainer-batches/${encodedId}`);
      handleCloseModal();
      console.log(batchId)
    }
  };

  const trainer = trainerDetails?.trainerinfo;
  const courses = trainerDetails?.trainercourses || [];
console.log(selectedCourse);

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2">
        {trainer ? (
          <>
            {/* Trainer Info Section */}
            <div className={`px-4 py-4 col-span-6 w-full h-[25rem] shadow-md rounded-xl ${theme.specificPageBg}`}>
              <div className="w-full h-auto px-1 py-2 text-lg font-semibold flex justify-between">
                <p className="ml-0"># {trainer?.trainer_id}</p>
              </div>
              <div className="grid 2xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 text-xs px-4 py-4 gap-x-1 gap-y-6">
                {[
                  { label: 'Name', value: trainer.name },
                  { label: 'Date of Joining', value: dayjs(trainer.date_of_joining).format('DD/MM/YYYY') },
                  { label: 'Phone Number', value: trainer.phone },
                  { label: 'Email Address', value: trainer.email },
                  { label: 'Week Off', value: trainer.week_off },
                  { label: 'Location', value: trainer.location },
                  { label: 'Experience', value: trainer.experience },
                  { label: 'Is Team Leader', value: trainer.is_teamleader ? 'Yes' : 'No' },
                  { label: 'Team Leader', value: trainer.team_leader || 'N/A' },
                  { label: 'Leave Status', value: trainer.leave_status || 'On Duty' },
                  { label: 'Coordinator', value: trainer.coordinator },
                ].map((item, i) => (
                  <div key={i} className="col-span-1 px-1 py-1">
                    <h1 className="font-serif">{item.label}</h1>
                    <p className="font-semibold text-[14px] leading-6">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainer Courses Section */}
            <div className={`px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg ${theme.specificPageBg}`}>
              <div className="w-full font-semibold">
                <div className="col-span-1 text-lg px-1 py-3">
                  <h1>Courses</h1>
                </div>

                <div className="col-span-1 leading-8 overflow-y-scroll bg-white/40 rounded-md">
                  <table className="w-full text-xs font-normal text-left h-auto">
                    <thead className="text-xs font-normal text-gray-600 uppercase bg-white sticky top-0 z-10">
                      <tr className="bg-gray-50/80">
                        <th className="px-1 py-2">S.No</th>
                        <th className="px-1 py-2">Course Name</th>
                        <th className="px-1 py-2">Batch Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses?.map((item, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCourseClick(item)}
                        >
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-1 py-2 font-semibold">
                            {item.course_name}
                          </td>
                          <td className="px-1 py-2">
                            <Tag color={item.batch_count > 0 ? 'blue' : 'default'}>
                              {item.batch_count}
                            </Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal */}
            <Modal
              title={<span className={`2xl:text-xl font-semibold ${theme.text}`}>Batch Details ({selectedCourse?.batches?.length})</span>}
              open={isModalOpen}
              onCancel={handleCloseModal}
              footer={null}
              width={800}
              bodyStyle={{ padding: '0px' }}
              centered
              className={`rounded-xl text-md 2xl:text-lg ${theme.specificPageBg}`}
            >
              {selectedCourse && (
                <div className="spacey-6">
                  {/* Batch Info Table */}
                  {selectedCourse.batches?.length > 0 && (
                    <div className="mt-0">
                      <h3 className="text-md font-semibold mb-2">Your all {selectedCourse?.course_name} batches</h3>
                      <div className="overflow-x-auto rounded-md">
                        <div className="max-h-72 overflow-y-auto">
                          <table className="min-w-full text-sm text-center text-gray-700 border">
                            <thead className={`${theme.specificPageBg} text-gray-900 text-xs uppercase sticky top-0 z-10`}>
                              <tr className="bg-gray-50/80">
                                <th className="px-4 py-3">S.NO</th>
                                <th className="px-4 py-3">Batch ID</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Start Date</th>
                                <th className="px-4 py-3">End Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCourse.batches.map((batch, index) => (
                                <tr
                                  key={batch.id}
                                  onClick={() => handleBatchClick(batch.id)}
                                  className="bg-white hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                                >
                                  <td className="px-4 py-2">{index + 1}</td>
                                  <td className="px-4 py-2 font-medium">{batch.batch_id}</td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={`px-2 py-1 rounded-xl text-xs font-semibold ${
                                        batch.status === 'Completed'
                                          ? 'bg-blue-100 text-blue-700'
                                          : batch.status === 'Upcoming'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}
                                    >
                                      {batch.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-green-700 font-medium">
                                    {batch.start_date || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 text-green-700 font-medium">
                                    {batch.end_date || 'N/A'}
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
              )}
            </Modal>
          </>
        ) : (
          <div className="col-span-6 text-center text-gray-500">Loading trainer info...</div>
        )}
      </div>
    </div>
  );
};

export default TrainerInfo;