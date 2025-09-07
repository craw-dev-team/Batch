
import { Card, Col, Row } from 'antd';
import { useTrainerForm } from '../../../Trainercontext/TrainerFormContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../Themes/ThemeContext';



const TrainerCards = () => {
    const { getTheme } = useTheme();
    const theme = getTheme();

    const { trainersCount, fetchTrainersCount } = useTrainerForm();
    const [selectedCard, setSelectedCard] = useState(null);

    const navigate = useNavigate();


    useEffect(() => {
      fetchTrainersCount();
    },[]);


const total_trainer = () => {
  navigate(`/trainers`)
};

const trainer_on_leave = () => {
  navigate(`/trainersdata/trainer_on_leave` )
};

const active_trainer = () => {
  navigate(`/trainersdata/active_trainer` )
};

const inactive_trainer= () => {
  navigate(`/trainersdata/inactive_trainer` )
};

const saket = () => {
  navigate(`/trainersdata/saket` )
};

const laxmi_nagar = () => {
  navigate(`/trainersdata/laxmi_nagar` )
};


const handleCardClick = (cardType, callback) => {
  setSelectedCard(cardType);
  callback(); // Call the original function (e.g., `enrolled_students`)
};

    
    return (
        <Row gutter={[14, 14]}>
          {[
            { key: "all", label: "Total Trainers", count: trainersCount?.all_in_one?.total_count_trainer || '0', data:total_trainer },
            { key: "leave", label: "Trainers on leave", count: trainersCount?.all_in_one?.leave_count_trainer || '0', data: trainer_on_leave },
            { key: "active_trainers", label: "Active Trainers", count: trainersCount?.all_in_one?.active_count_trainer || '0', data: active_trainer },
            { key: "inactive_trainers", label: "Inactive Trainers", count: trainersCount?.all_in_one?.inactive_count_trainer || '0', data: inactive_trainer },
            { key: "Saket", label: "Saket", count: trainersCount?.all_in_one?.Saket_count_trainer || '0', data: saket },
            { key: "Laxmi Nagar", label: "Laxmi Nagar", count: trainersCount?.all_in_one?.Laxmi_Nagar_count_trainer || '0', data: laxmi_nagar },
          ].map(({ key, label, count, data }, index) => (
            <Col span={4} key={key}>
              <Card
                title={<span className={`text-${theme.cards[index]} text-2xl`}>{count}</span>}
                variant="bordered"
                className={`cursor-pointer rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 font-bold opacity-80 ${theme.cards[index] || ""} ${
                  selectedCard === key ? `${theme.cards[index]} border-2 opacity-100` : ""
                }`}
                styles={{
                  header: {
                    padding: '2px 8px',
                    height: '28px',
                    backgroundColor: `${theme.cards[key] || ''}`,
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
                 onClick= {() =>handleCardClick(key, data) }
              >
                <div className="truncate">{label}</div>
              </Card>
            </Col>
          ))}
        </Row>

    )
}
export default TrainerCards;