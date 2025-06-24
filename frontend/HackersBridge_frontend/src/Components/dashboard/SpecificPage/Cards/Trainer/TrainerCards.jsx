
import { Card, Col, Row } from 'antd';
import { useBatchForm } from '../../../Batchcontext/BatchFormContext';
import { useTrainerForm } from '../../../Trainercontext/TrainerFormContext';
import { useEffect } from 'react';



const TrainerCards = ({ handleTabClick, activeTab }) => {

    const { trainersCount, fetchTrainersCount } = useTrainerForm();

    useEffect(() => {
      fetchTrainersCount();
    },[]);

    
    return (
        <Row gutter={[14, 14]}>
          {[
            { key: "all", label: "Total Trainers", count: trainersCount?.all_in_one?.total_count_trainer || '0' },
            { key: "leave", label: "Trainers on leave", count: trainersCount?.all_in_one?.leave_count_trainer || '0' },
            { key: "active_trainers", label: "Active Trainers", count: trainersCount?.all_in_one?.active_count_trainer || '0' },
            { key: "inactive_trainers", label: "Inactive Trainers", count: trainersCount?.all_in_one?.inactive_count_trainer || '0' },
            { key: "Saket", label: "Saket", count: trainersCount?.all_in_one?.Saket_count_trainer || '0' },
            { key: "Laxmi Nagar", label: "Laxmi Nagar", count: trainersCount?.all_in_one?.Laxmi_Nagar_count_trainer || '0' },
          ].map(({ key, label, count }) => (
            <Col span={4} key={key}>
              <Card
                title={<span style={{ fontSize: '18px' }}>{count}</span>}
                variant="bordered"
                className={`!p-0 rounded-md shadow-sm font-semibold transition-all duration-150 ${
                  key !== "all" ? "cursor-pointer" : "cursor-default"
                }
                  ${activeTab === key && key !== "all" ? "bg-blue-50 text-blue-600 border-blue-400" : "text-gray-800 border-gray-200"
                  }`}
                styles={{
                  header: {
                    padding: '2px 8px',
                    height: '28px',
                    backgroundColor: '#ebf5ff',
                  },
                  body: {
                    padding: '4px 8px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '40px',
                    overflow: 'hidden',
                  }
                }}
                {...(key !== "all" && { onClick: () => handleTabClick(key) })}
              >
                <div className="truncate">{label}</div>
              </Card>
            </Col>
          ))}
        </Row>

    )
}
export default TrainerCards;