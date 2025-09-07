import React, { useState, useEffect, useMemo } from 'react';
import { Card, Empty, Tag, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CalendarOutlined,
  ProfileOutlined,
  FieldTimeOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useTrainerBatches } from './TrainerBatchesContext';
// import TrainerBatchesInfo from './TrainerBatchesInfo';
import crawlogo from '../../../../../assets/images/crawlogo.png';

dayjs.extend(customParseFormat);

const TrainerBatches = () => {
  const { trainerBatches, fetchTrainerBatches, loading } = useTrainerBatches();
  const [searchTerm, setSearchTerm] = useState('');
//   const [selectedBatch, setSelectedBatch] = useState(null);
const navigate = useNavigate();


  useEffect(() => {
    fetchTrainerBatches();
  }, []);


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
        console.log(id);
        
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
        className="shadow hover:shadow-lg hover:scale-[1.01] transition-transform cursor-pointer"
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
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h1 className="text-2xl text-sky-600 font-semibold">Your Batches</h1>
        {/* <Input.Search
          placeholder="Search Batch"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-60"
          allowClear
        /> */}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold bg-sky-100 px-2 py-1 rounded">Your Ongoing Batches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-2">
          {renderBatchCards(filteredBatches?.Ongoing)}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold bg-sky-100 px-2 py-1 rounded">Your Scheduled Batches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-2">
          {renderBatchCards(filteredBatches?.Scheduled)}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold bg-sky-100 px-2 py-1 rounded">Your Completed Batches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-2">
          {renderBatchCards(filteredBatches?.Completed)}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold bg-blue-100 px-2 py-1 rounded">Your Hold Batches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-2">
          {renderBatchCards(filteredBatches?.Hold)}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold bg-blue-100 px-2 py-1 rounded">Your Cancelled Batches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mt-2">
          {renderBatchCards(filteredBatches?.Cancel)}
        </div>
      </div>
    </div>
  );
};

export default TrainerBatches;
