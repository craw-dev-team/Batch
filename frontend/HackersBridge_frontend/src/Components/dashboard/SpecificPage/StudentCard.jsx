import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import { useStudentForm } from '../StudentContext/StudentFormContext';
import { useNavigate } from 'react-router-dom';

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
        <Row gutter={14}>
        <Col span={4}>
          <Card title={studentsCounts?.total_student || '0'} variant="borderless" className={`font-semibold cursor-pointer ${selectedCard === "total_students" ? "text-blue-500" : "text-black"}`} onClick={() => handleCardClick("total_atudents", total_student)}>
            Total Students
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.enrolled_student_count || '0'} variant="borderless" className={`font-semibold cursor-pointer ${selectedCard === "enrolled" ? "text-blue-500" : "text-black"}`} onClick={() => handleCardClick("enrolled", enrolled_students)}>
            Batch Assigned
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.not_enrolled_student_count || '0'} variant="borderless" className={`font-semibold cursor-pointer ${selectedCard === "not_enrolled" ? "text-blue-500" : "text-black"}`} onClick={() => handleCardClick("not_enrolled", not_enrolled_students)}>
            Batch Not Assigned
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.today_added_student_count || '0'} variant="borderless" className={`font-semibold cursor-pointer ${selectedCard === "today_added" ? "text-blue-500" : "text-black"}`} onClick={() => handleCardClick("today_added", today_added_students)}>
             Enrolled Today
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.active_student_count || '0'} variant="borderless" className={`font-semibold cursor-pointer ${selectedCard === "active_students" ? "text-blue-500" : "text-black"}`} onClick={() => handleCardClick("active_students", active_Students)}>
            Active Students
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.inactive_student_count || '0'} variant="borderless" className={`font-semibold cursor-pointer ${selectedCard === "inactive_students" ? "text-blue-500" : "text-black"}`} onClick={() => handleCardClick("inactive_students", inactive_Students)}>
            Inactive Students
          </Card>
        </Col>
        {/* <Col span={4}>
          <Card title="Card title" variant="borderless">
            Card content
          </Card>
        </Col> */}
      </Row>
    )
}
export default StudentCards;