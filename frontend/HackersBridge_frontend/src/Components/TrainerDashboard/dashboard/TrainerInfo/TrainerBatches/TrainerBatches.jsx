import React, { useState, useEffect, useMemo } from 'react';
import { Card, Empty, Tag, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CalendarOutlined,
  ProfileOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useTrainerBatches } from './TrainerBatchesContext';
// import TrainerBatchesInfo from './TrainerBatchesInfo';
import crawlogo from '../../../../../assets/images/crawlogo.png';
import { useTheme } from '../../../../Themes/ThemeContext';



dayjs.extend(customParseFormat);

const TrainerBatches = () => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------

  const { trainerBatches, fetchTrainerBatches, loading } = useTrainerBatches();
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
//   const [selectedBatch, setSelectedBatch] = useState(null);
const navigate = useNavigate();


  useEffect(() => {
    fetchTrainerBatches();
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
  


  const filteredBatches = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filter = (arr = []) =>
      arr.filter(
        (b) =>
          (b.batch_id || '').toLowerCase().includes(term) ||
          (b.course || '').toLowerCase().includes(term)
      );

    const data = trainerBatches?.batches || {};

    return {
      Ongoing: filter(data.Ongoing_batch),
      Scheduled: filter(data.Scheduled_batch),
      Completed: filter(data.Completed_batch),
      Hold: filter(data.Hold_batch),
      Cancel: filter(data.Cancelled_batch),
    };
  }, [trainerBatches, searchTerm]);

  const renderBatchCards = (batches = []) => {
    if (loading) return <div>Loading...</div>;
    if (batches.length === 0) return <Empty description="No Batches Found" />;



  // HANDLE NAVIGATE TO BATCH INFO
    const handlenavigate = (id) => {        
        if (!id) return;
        const encodedBatchId = btoa(id)
        navigate(`/trainer-info/trainer-batches/${encodedBatchId}/`);
        console.log(encodedBatchId);
        
      };

    return batches.map((batch, idx) => (
      <Card
        key={idx}
        onClick={() => handlenavigate(batch.id)}
        hoverable
        className={`shadow hover:shadow-lg hover:scale-[1.01] transition-transform cursor-pointer`}
        title={
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold">{batch.batch_id}</span>
            <div className="flex">
              <FieldTimeOutlined className="text-gray-400 mr-1" />
              <div className="flex flex-col items-end">
                <span className="text-xs">
                  {dayjs(batch.start_time, 'HH:mm:ss').format('hh:mm A')}
                </span>
                <span className="text-xs">
                  {dayjs(batch.end_time, 'HH:mm:ss').format('hh:mm A')}
                </span>
              </div>
            </div>
          </div>
        }
        bodyStyle={{ padding: 12 }}
      >
        <div className="flex flex-col gap-2 text-left">
          <p><ProfileOutlined className="text-gray-400" /> {batch.course}</p>
          <p><CalendarOutlined className="text-gray-400" /> {dayjs(batch.start_date).format('DD/MM/YYYY')} - {dayjs(batch.end_date).format('DD/MM/YYYY')}</p>
          <p><TeamOutlined className="text-gray-400" /> Students: {batch.student_count}</p>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-1 flex-wrap">
              <Tag color={batch.mode === 'Offline' ? 'green' : batch.mode === 'Online' ? 'red' : 'geekblue'}>{batch.mode}</Tag>
              <Tag color={batch.language === 'Hindi' ? 'green' : batch.language === 'English' ? 'volcano' : 'blue'}>{batch.language}</Tag>
              <Tag color={batch.preferred_week === 'Weekends' ? 'gold' : 'cyan'}>{batch.preferred_week}</Tag>
            </div>
            <img className="w-8 h-8" src={crawlogo} alt="CRAW Logo" />
          </div>
        </div>
      </Card>
    ));
  };

//   if (selectedBatch) {
//     return <TrainerBatchesInfo batch={selectedBatch} onBack={() => setSelectedBatch(null)} />;
//   }

  return (
    <div className="w-full h-[100vh] md:h-[100vh] lg:h-[100vh] 2xl:max-h-[calc(100vh-3rem)] flex flex-col">
      {/* Main Content Area with adjusted height */}
      <div className={`flex-1 col-span-6 w-full shadow-md sm:rounded-lg relative flex flex-col overflow-hidden ${theme.specificPageBg}`}>
        <div className="sticky top-0 left-0 z-10 border-b border-gray-200">
          <div className="w-full px-2 py-3 flex justify-between items-center">
            <div className='flex flex-col leading-7'>
              <h1 className="text-xl font-bold">Your Batches</h1>
              <span className='text-sm text-gray-600'>Manage and track all your programming batches</span>
            </div>

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
                      className={`block w-full h-8 ps-2 pe-8 text-sm font-medium ${theme.searchBg}`} />
                </div>
              </div>
          </div>
        </div>


        <div className="flex-1 overflow-y-auto">
        {(renderBatchCards(filteredBatches?.Ongoing || []).length >= 0 ? (
          <div className="">
            <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
              <div className='flex items-center'>
                <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-green-300 to-emerald-600 flex items-center justify-center mr-4 shadow-lg`}>
                  <FieldTimeOutlined className="text-white" />
                </div>
                <div className='flex flex-col leading-7'>
                  <p className='font-bold'>Ongoing Batches</p> 
                  <span className='text-sm text-gray-600'>Currently active batches in session</span>
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                <span className="text-gray-700 text-sm font-semibold">{renderBatchCards(filteredBatches?.Ongoing).length} {renderBatchCards(filteredBatches?.Ongoing).length < 1 ? 'batch' : 'batches'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 px-2 py-4">
              {renderBatchCards(filteredBatches?.Ongoing)}
            </div>
          </div>
        ): (""))}


        {(renderBatchCards(filteredBatches?.Scheduled || []).length >= 0 ? (
          <div className="">
            <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
              <div className='flex items-center'>
                <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-600 flex items-center justify-center mr-4 shadow-lg`}>
                  <ScheduleOutlined className="text-white" />
                </div>
                <div className='flex flex-col leading-7'>
                  <p className='font-bold'>Scheduled Batches</p> 
                  <span className='text-sm text-gray-600'>Upcoming batches ready to start</span>
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                <span className="text-gray-700 text-sm font-semibold">{renderBatchCards(filteredBatches?.Scheduled).length} {renderBatchCards(filteredBatches?.Scheduled).length < 1 ? 'batch' : 'batches'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 px-2 py-4">
              {renderBatchCards(filteredBatches?.Scheduled)}
            </div>
          </div>
        ): (""))}


        {(renderBatchCards(filteredBatches?.Hold || []).length >= 0 ? (
          <div className="mb-4">
            <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
              <div className='flex items-center'>
                <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-yellow-300 to-rose-600 flex items-center justify-center mr-4 shadow-lg`}>
                  <PauseCircleOutlined className="text-white" />
                </div>
                <div className='flex flex-col leading-7'>
                  <p className='font-bold'>Hold Batches</p> 
                  <span className='text-sm text-gray-600'>Batches on hold</span>
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                <span className="text-gray-700 text-sm font-semibold">{renderBatchCards(filteredBatches?.Hold).length} {renderBatchCards(filteredBatches?.Hold).length < 1 ? 'batch' : 'batches'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 px-2 py-4">
              {renderBatchCards(filteredBatches?.Hold)}
            </div>
          </div>
        ) : (""))}


        {(renderBatchCards(filteredBatches?.Completed || []).length >= 0 ? (
          <div className="mb-4">
            <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
              <div className='flex items-center'>
                <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-blue-300 to-indigo-600 flex items-center justify-center mr-4 shadow-lg`}>
                  <CheckCircleOutlined className="text-white" />
                </div>
                <div className='flex flex-col leading-7'>
                   <p className='font-bold'>Your Completed Batches</p>
                    <span className='text-sm text-gray-600'>Successfully finished batches</span>
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                <span className="text-gray-700 text-sm font-semibold">{renderBatchCards(filteredBatches?.Completed).length} {renderBatchCards(filteredBatches?.Completed).length < 1 ? 'batch' : 'batches'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 px-2 py-4">
              {renderBatchCards(filteredBatches?.Completed)}
            </div>
          </div>
        ): (""))}


        {(renderBatchCards(filteredBatches?.Cancel || []).length >= 0 ? (
          <div className="mb-4">
            <div className="w-full h-auto px-2 py-0.5 text-lg bg-white/30 backdrop-blur-lg border border-white/20 rounded-md flex justify-between items-center">
              <div className='flex items-center'>
                <div className={`w-12 h-11 rounded-2xl bg-gradient-to-br from-rose-300 to-red-600 flex items-center justify-center mr-4 shadow-lg`}>
                  <CloseCircleOutlined className="text-white" />
                </div>
                <div className='flex flex-col leading-7'>
                  <p className='font-bold'>Cancelled Batches</p> 
                  <span className='text-sm text-gray-600'>Batches cancelled</span>
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-0.5 rounded-xl">
                <span className="text-gray-700 text-sm font-semibold">{renderBatchCards(filteredBatches?.Cancel).length} {renderBatchCards(filteredBatches?.Cancel).length < 1 ? 'batch' : 'batches'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 px-2 py-4">
              {renderBatchCards(filteredBatches?.Cancel)}
            </div>
          </div>
        ) : (""))}

        </div>
      </div>
    </div>
    
  );
};

export default TrainerBatches;
