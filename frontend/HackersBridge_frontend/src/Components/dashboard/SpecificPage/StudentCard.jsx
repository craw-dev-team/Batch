import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import { useStudentForm } from '../StudentContext/StudentFormContext';

const StudentCards = () => {
  const { studentsCounts, fetchStudentCount } = useStudentForm();


  useEffect(() => {
        fetchStudentCount(); 

}, []);


    return (
        <Row gutter={14}>
        <Col span={4}>
          <Card title={studentsCounts?.total_student || '0'} variant="borderless">
            Total Students
          </Card>
        </Col>
        <Col span={4}>
          <Card title= {studentsCounts?.enrolled_student || '0'} variant="borderless">
            Enrolled in Batch
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.not_enrolled_student || '0'} variant="borderless">
            Not Enrolled Yet
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.active_student || '0'} variant="borderless">
            Active Students
          </Card>
        </Col>
        <Col span={4}>
          <Card title={studentsCounts?.today_added_student_count || '0'} variant="borderless">
             Enrolled Today
          </Card>
        </Col>
        <Col span={4}>
          {/* <Card title={countBatchesByType.cancelled || '0'} variant="borderless"> */}
            Inactive Students
          {/* </Card> */}
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