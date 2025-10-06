import React, { useState, useEffect, useMemo } from 'react';
import { Card, Empty, message, Tag } from 'antd';
import { UserOutlined, CalendarOutlined, ProfileOutlined, FieldTimeOutlined, ScheduleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RequestBatchForm from './RequestBatch/RequestBatchForm';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import NotificationIcon from '../../../../../svg/NotificationIcon';
import crawlogo from '../../../../../assets/images/crawlogo.png'
import { useStudentBatch } from './StudentBatchContext';
import StudentBatchLoading from '../../../../../Pages/SkeletonLoading.jsx/StudentBatchLoading';




const StudentBatches = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { studentBatch, loading, fetchStudentBatches } = useStudentBatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    fetchStudentBatches()
  }, []);


  // HANDLE SEARCH INPUT AND DEBOUNCE 
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(inputValue.trimStart());
        }, 500); // debounce delay in ms
        
        return () => {
            clearTimeout(handler); // clear previous timeout on re-typing
        };
    }, [inputValue]);


  // FILTER BATCHES FROM ONGOING, SCHEDULED, COMPLETED BASED ON BATCH ID, COURSE NAME, TRAINER NAME
  const searchFilteredBatches = useMemo(() => {
    const term = searchTerm.toLowerCase();

    if (!studentBatch?.batch) return { batch: {} };

    const filterCategory = (category = []) =>
      category.filter(batch =>
        (batch.batch_id?.toLowerCase() || "").includes(term) ||
        (batch.course_name?.toLowerCase() || "").includes(term) ||
        (batch.trainer_name?.toLowerCase() || "").includes(term)
      );

    if (!searchTerm) return studentBatch;

    return {
      batch: {
        Ongoing_batch: filterCategory(studentBatch.batch.Ongoing_batch),
        Completed_batch: filterCategory(studentBatch.batch.Completed_batch),
        Scheduled_batch: filterCategory(studentBatch.batch.Scheduled_batch)
      }
    };
  }, [studentBatch, searchTerm]);



  // HANDLE NAVIGATE TO BATCH INFO
  const handleCardClick = (batchId) => {
    if (!batchId) return;
    const encodedBatchId = btoa(batchId)
    navigate(`/student-info/student-batches/${encodedBatchId}/`);
  };




  return (
    <>
    {/* <div className="w-full h-screen flex flex-col">
          <div className="col-span-6 w-full h-[90vh] md:h-[85vh] lg:h-[100vh] 2xl:max-h-[100vh] shadow-md sm:rounded-lg border border-gray-50 bg-white relative flex flex-col scrollbar-custom">
          <div className="sticky top-0 left-0 z-10 bg-white border-b border-gray-200">
            <div className="w-full h-auto px-2 py-3 text-lg font-semibold flex justify-between bg-white border-b sticky top-0 left-0  z-10"> 
                <span>Batches</span>
              <div className="flex justify-end items-center ml-3">
                <div className="relative w-22 sm:w-56 md:w-56 lg:w-72 xl:w-80 2xl:w-96">
                  <div className="absolute inset-y-0 end-0 flex items-center pe-2">
                    <button onClick={() => setSearchTerm("")}>
                      {searchTerm ? (
                        <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <input onChange={(e) => setSearchTerm(e.target.value.replace(/^\s+/, ''))} value={searchTerm}
                    type="text"
                    placeholder="Search Batch"
                    className="block w-full h-8 ps-2 pe-8 text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-0 focus:border-green-500" />
                </div>


                <div className="ml-5 flex items-center">

                </div>
              </div>
                <button onClick={() => setIsModalOpen(true)} type='button' className="text-xs bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-500 transition">Request</button>
            </div>
            </div>

            {(searchFilteredBatches?.batch?.Ongoing_batch || []).length > 0 ? ( 
              <>
              <div className="w-full h-auto px-4 py-0.5 text-lg font-semibold bg-green-100 rounded-xs">
                <p>Your Ongoing Batches</p>
              </div>
            

            <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>
                  
                  {(searchFilteredBatches?.batch?.Ongoing_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center min-h-[100px]">
                      <Empty description="No Ongoing Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.Ongoing_batch.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1'/>
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem]  duration-300 shadow-md hover:shadow-xl transition-shadow hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left px-[14px] py-2">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400' /> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <p className="mb-1 w-full">
                            <UserOutlined className='text-gray-400' /> {batch.trainer_name}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
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
                            </div>

                            {(batch.mode === "Hybrid" || batch.mode === "Online") ? (
                              <button type='button' className='bg-green-500 px-2 py-1 text-white rounded-md border-green-600 hover:bg-green-400'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (batch?.batch_link) {
                                    window.open(batch?.batch_link, "_blank");
                                  } else {
                                    message.info("Class link not available");
                                  }
                                }}
                              >
                                Join
                              </button>
                            ) : <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ) : ("")}



            {(searchFilteredBatches?.batch?.Scheduled_batch || []).length > 0 ? (
              <>
              <div className="w-full h-auto px-4 py-0.5 mt-2 text-lg font-semibold bg-green-100 rounded-xs">
                <p>Your Scheduled Batches</p>
              </div>
            

            <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>

                  {(searchFilteredBatches?.batch?.Scheduled_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center h-[100px]">
                      <Empty description="No Scheduled Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.Scheduled_batch?.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1' />
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem] transition-shadow duration-300 shadow-md hover:shadow-xl hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left p-[14px]">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400'/> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
                              <p>
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
                            </div>

                            <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />

                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ) : ("")}


            {(searchFilteredBatches?.batch?.Completed_batch || []).length > 0 ? (
              <>
              <div className="w-full h-auto px-4 py-0.5 mt-2 text-lg font-semibold bg-green-100 rounded-xs">
                <p>Your Completed Batches</p>
              </div>

              <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>
                  
                  {(searchFilteredBatches?.batch?.Completed_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center h-[100px]">
                      <Empty description="No Scheduled Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.Completed_batch?.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1' />
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem] transition-shadow duration-300 shadow-md hover:shadow-xl hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left p-[14px]">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400' /> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <p className="mb-1 w-full">
                            <UserOutlined className='text-gray-400' /> {batch.trainer_name}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
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
                            </div>

                            <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ): ("")}

            <RequestBatchForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>
    </div> */}

     <div className="w-full h-[100vh] md:h-[100vh] lg:h-[100vh] 2xl:max-h-[calc(100vh-3rem)] flex flex-col">

      {/* Main Content Area with adjusted height */}
      <div className="flex-1 col-span-6 w-full shadow-md sm:rounded-lg bg-white relative flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 left-0 z-10 bg-white border-b border-gray-200">
          <div className="w-full px-2 py-3 flex justify-between items-center">
            <div className='flex flex-col leading-7'>
              <h1 className='text-xl font-bold'>Batches</h1>
              <span className='text-sm '>Manage and track all your programming batches</span>
            </div>
            
              {/* Search Input */}
              <div className="flex justify-end items-center ml-3">
                <div className="relative w-22 sm:w-56 md:w-56 lg:w-72 xl:w-80 2xl:w-96">
                  <div className="absolute inset-y-0 end-0 flex items-center pe-2">
                    <button onClick={() => {setInputValue(""); setSearchTerm("");}}>
                      {searchTerm ? (
                        <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <input onChange={(e) => setInputValue(e.target.value.replace(/^\s+/, ''))} value={inputValue}
                    type="text"
                    placeholder="Search Batch"
                    className="block w-full h-8 ps-2 pe-8 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-0 focus:border-green-400" />
                </div>


                <div className="ml-5 flex items-center">

                </div>
              </div>

              {/* Request Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="text-sm bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
              >
                Request
              </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Ongoing Batches */}
          {(searchFilteredBatches?.batch?.Ongoing_batch || []).length > 0 ? ( 
              <>
              <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
                <div className='flex items-center'>
                  <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mr-4 shadow-lg`}>
                    <FieldTimeOutlined className="text-white" />
                  </div>
                  <div className='flex flex-col leading-7'>
                    <p className='font-bold'>Your Ongoing Batches</p> 
                    <span className='text-sm'>Currently active batches in session</span>
                  </div>
                </div>

                {/* <span>{searchFilteredBatches?.batch?.Ongoing_batch.length} batch</span> */}
                 <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                  <span className="text-gray-700 font-semibold">{searchFilteredBatches?.batch?.Ongoing_batch.length} {searchFilteredBatches?.batch?.Ongoing_batch.length < 1 ? 'batch' : 'batches'}</span>
                </div>
              </div>
            

            <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>
                  
                  {(searchFilteredBatches?.batch?.Ongoing_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center min-h-[100px]">
                      <Empty description="No Ongoing Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.Ongoing_batch.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1'/>
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem]  duration-300 shadow-md hover:shadow-xl transition-shadow hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left px-[14px] py-2">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400' /> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <p className="mb-1 w-full">
                            <UserOutlined className='text-gray-400' /> {batch.trainer_name}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
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
                            </div>

                            {(batch.mode === "Hybrid" || batch.mode === "Online") ? (
                              <button type='button' className={`${batch.batch_link ? "bg-green-500  hover:bg-green-400" : "bg-gray-400  hover:bg-gray-500"} px-3 py-0.5 text-white rounded-lg`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (batch?.batch_link) {
                                    window.open(batch?.batch_link, "_blank");
                                  } else {
                                    message.info("Class link not available");
                                  }
                                }}
                              >
                                Join
                              </button>
                            ) : <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ) : ("")}



            {/* Hold Batches  */}

            {(searchFilteredBatches?.batch?.hold_batch || []).length > 0 ? ( 
              <>
              <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
                <div className='flex items-center'>
                   <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-rose-600 flex items-center justify-center mr-4 shadow-lg`}>
                    <FieldTimeOutlined className="text-white" />
                  </div>
                  <div className='flex flex-col leading-7'>
                    <p className='font-bold'>Your Hold Batches</p>
                    <span className='text-sm'>Batches on hold</span>
                  </div>
                </div>

                <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                  <span className="text-gray-700 font-semibold">{searchFilteredBatches?.batch?.hold_batch.length} {searchFilteredBatches?.batch?.hold_batch.length < 1 ? 'batch' : 'batches'}</span>
                </div>
              </div>
            

            <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>
                  
                  {(searchFilteredBatches?.batch?.hold_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center min-h-[100px]">
                      <Empty description="No Ongoing Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.hold_batch.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1'/>
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem]  duration-300 shadow-md hover:shadow-xl transition-shadow hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left px-[14px] py-2">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400' /> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <p className="mb-1 w-full">
                            <UserOutlined className='text-gray-400' /> {batch.trainer_name}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
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
                            </div>

                            <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ) : ("")}

          {/* Scheduled Batches */}
          {(searchFilteredBatches?.batch?.Scheduled_batch || []).length > 0 ? (
              <>
              <div className="w-full h-auto px-2 py-0.5 mt-2 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
                <div className='flex items-center'>
                  <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mr-4 shadow-lg`}>
                    <ScheduleOutlined className="text-white" />
                  </div>
                  <div className='flex flex-col leading-7'>
                    <p className='font-bold'>Your Scheduled Batches</p>
                    <span className='text-sm'>Upcoming batches ready to start</span>
                  </div>
                </div>

                <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                  <span className="text-gray-700 font-semibold">{searchFilteredBatches?.batch?.Scheduled_batch.length} {searchFilteredBatches?.batch?.Scheduled_batch.length < 1 ? 'batch' : 'batches'}</span>
                </div>
              </div>
            

            <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>

                  {(searchFilteredBatches?.batch?.Scheduled_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center h-[100px]">
                      <Empty description="No Scheduled Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.Scheduled_batch?.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1' />
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem] transition-shadow duration-300 shadow-md hover:shadow-xl hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left p-[14px]">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400'/> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
                              <p>
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
                            </div>

                            <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />

                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ) : ("")}

          {/* Completed Batches */}
          {(searchFilteredBatches?.batch?.Completed_batch || []).length > 0 ? (
              <>
              <div className="w-full h-auto px-2 py-0.5 mt-2 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
                <div className='flex items-center'>
                   <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mr-4 shadow-lg`}>
                    <CheckCircleOutlined className="text-white" />
                  </div>
                  <div className='flex flex-col leading-7'>
                    <p className='font-bold'>Your Completed Batches</p>
                    <span className='text-sm'>Successfully finished batches</span>
                  </div>
                </div>

                <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                  <span className="text-gray-700 font-semibold">{searchFilteredBatches?.batch?.Completed_batch.length} {searchFilteredBatches?.batch?.Completed_batch.length < 1 ? 'batch' : 'batches'}</span>
                </div>
              </div>

              <div className="grid 2xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4">
              {loading ? (
                <>
                  <StudentBatchLoading />
                </>
              ) : (
                <>
                  
                  {(searchFilteredBatches?.batch?.Completed_batch || []).length === 0 ? (
                    <div className="w-full col-span-full flex justify-center items-center h-[100px]">
                      <Empty description="No Scheduled Batches" />
                    </div>
                  ) : (
                    // Render Batches
                    searchFilteredBatches?.batch?.Completed_batch?.map((batch, index) => (
                      <Card
                        key={index}
                        title={
                          <div className="w-full flex justify-between items-start">
                            <div className='flex items-center gap-2'>
                              <span className="text-sm font-semibold">{batch.batch_id}</span>
                            </div>

                            <div className="flex ">
                              <FieldTimeOutlined className='text-gray-400 mr-1' />
                              <div className='flex flex-col items-end'>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.start_time ? batch.batch_time_data.start_time : "N/A"}
                                </span>
                                <span className="text-xs text-gray-900">
                                  {batch.batch_time_data?.end_time ? batch.batch_time_data.end_time : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        }
                        styles={{
                          body: {
                            padding: 0,
                            width: "100%",
                            margin: 0,
                          },
                          header: {
                            paddingLeft: 14,
                            paddingRight: 14,
                            paddingTop: 8,
                            paddingBottom: 8,
                          },
                        }}
                        className="min-h-[10rem] transition-shadow duration-300 shadow-md hover:shadow-xl hover:scale-100 w-full cursor-pointer"
                        onClick={() => handleCardClick(batch.id)}
                      >
                        <div className="w-full flex flex-col items-start justify-start text-left p-[14px]">
                          <p className="mb-1 w-full font-serif">
                            <ProfileOutlined className='text-gray-400' /> {batch.course_name}
                          </p>

                          <p className="mb-1 w-full">
                            <CalendarOutlined className='text-gray-400' /> {dayjs(batch.start_date).format("DD/MM/YYYY")} - {dayjs(batch.end_date).format("DD/MM/YYYY")}
                          </p>

                          <p className="mb-1 w-full">
                            <UserOutlined className='text-gray-400' /> {batch.trainer_name}
                          </p>

                          <div className="w-full h-10 flex mt-1 justify-end items-end">
                            <div className='flex justify-between mb-1 w-full'>
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
                            </div>

                            <img className="w-8 h-7 mt-0" src={crawlogo} alt="" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
            </>
            ): ("")}
        </div>

        {/* Modal */}
       <RequestBatchForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
    </>


  )
}


export default StudentBatches;