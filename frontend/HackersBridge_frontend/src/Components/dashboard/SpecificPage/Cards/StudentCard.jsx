import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStudentForm } from '../../Studentcontext/StudentFormContext';




const StudentCards = () => {
  const { studentsCounts, fetchStudentCount } = useStudentForm();
  const [selectedCard, setSelectedCard] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
        fetchStudentCount(); 

  }, []);



const total_student = () => {
  navigate(`/students/`)
};


const today_added_students = () => {
  navigate(`/studentsdata/today_added_students`, { state : { data: studentsCounts.today_added_students, type: 'today_added_students' } } )
};

const enrolled_students = () => {
  navigate(`/studentsdata/enrolled_students`, { state : { data: studentsCounts.enrolled_students, type: 'enrolled_students' } } )
};

const not_enrolled_students= () => {
  navigate(`/studentsdata/not_enrolled_students`, { state : { data: studentsCounts.not_enrolled_students, type: 'not_enrolled_students' } } )
};

const active_Students = () => {
  navigate(`/studentsdata/active_students`, { state : { data: studentsCounts.active_students, type: 'active_students' } } )
};

const inactive_Students = () => {
  navigate(`/studentsdata/inactive_students`, { state : { data: studentsCounts.inactive_students, type: 'inactive_students' } } )
};


const handleCardClick = (cardType, callback) => {
  setSelectedCard(cardType);
  callback(); // Call the original function (e.g., `enrolled_students`)
};


    return (

       <>
        <Row gutter={[14, 14]}>
          {[
            { key: "total_students", label: "Total Students", count: studentsCounts?.total_student || '0', data: total_student },
            { key: "enrolled", label: "Batch Assigned", count: studentsCounts?.enrolled_student_count || '0', data: enrolled_students },
            { key: "not_enrolled", label: "Batch Not Assigned", count: studentsCounts?.not_enrolled_student_count || '0', data: not_enrolled_students },
            { key: "today_added", label: "Enrolled Today", count: studentsCounts?.today_added_student_count || '0', data: today_added_students },
            { key: "active_students", label: "Active Students", count: studentsCounts?.active_student_count || '0', data: active_Students },
            { key: "inactive_students", label: "Inactive Students", count: studentsCounts?.inactive_student_count || '0', data: inactive_Students }
          ].map(({ key, label, count, data }) => (
            <Col span={4} key={key}>
            <Card
          title={<span style={{ fontSize: '18px' }}>{count}</span>}
          variant="bordered"
          className={`!p-0 rounded-md shadow-sm cursor-pointer transition-all duration-150 ${
            selectedCard === key ? "text-blue-500 border-blue-500" : "text-gray-800 border-gray-200"
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