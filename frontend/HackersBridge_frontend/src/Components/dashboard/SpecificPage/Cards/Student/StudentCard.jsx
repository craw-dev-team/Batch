import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStudentForm } from '../../../Studentcontext/StudentFormContext';
import { useTheme } from '../../../../Themes/ThemeContext';




const StudentCards = () => {
    const { getTheme } = useTheme();
    const theme = getTheme();

  const { studentsCounts, fetchStudentCount } = useStudentForm();
  const [selectedCard, setSelectedCard] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
          fetchStudentCount(); 
  }, []);



const total_student = () => {
  navigate(`/students`)
};


const today_added_students = () => {
  navigate(`/studentsdata/today_added_students` )
};

const enrolled_students = () => {
  navigate(`/studentsdata/enrolled_students` )
};

const not_enrolled_students= () => {
  navigate(`/studentsdata/not_enrolled_students` )
};

const active_Students = () => {
  navigate(`/studentsdata/active_students` )
};

const inactive_Students = () => {
  navigate(`/studentsdata/inactive_students` )
};


const handleCardClick = (cardType, callback) => {
  setSelectedCard(cardType);
  callback(); // Call the original function (e.g., `enrolled_students`)
};


    return (

       <>
        <Row gutter={[14, 14]}>
          {[
            { key: "total_students", label: "Total Students", count: studentsCounts?.total_student || 0 , data: total_student },
            { key: "enrolled", label: "Batch Assigned", count: studentsCounts?.enrolled_students_count || 0 , data: enrolled_students },
            { key: "not_enrolled", label: "Batch Not Assigned", count: studentsCounts?.not_enrolled_students_count || 0 , data: not_enrolled_students },
            { key: "today_added", label: "Enrolled Today", count: studentsCounts?.today_added_students_count || 0 , data: today_added_students },
            { key: "active_students", label: "Active Students", count: studentsCounts?.active_students_count || 0 , data: active_Students },
            { key: "inactive_students", label: "Inactive Students", count: studentsCounts?.inactive_students_count || 0 , data: inactive_Students }
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
                onClick={() => handleCardClick(key, data)}
              >
              <div className="truncate">{label}</div>
              </Card>

            </Col>
          ))}
        </Row>

       </>
    )
}
export default StudentCards;