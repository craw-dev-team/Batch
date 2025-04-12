import React from 'react';
import { Card, Col, Row } from 'antd';
import { useBatchForm } from '../Batchcontext/BatchFormContext';



const BatchCards = ({ handleTabClick, activeTab }) => {

    const { countBatchesByType } = useBatchForm();
    return (
        <Row gutter={14}>
        <Col span={4}>
          <Card title={countBatchesByType.all ?? '0'} variant="borderless">
            Total Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title= {countBatchesByType.running ?? '0'} variant="borderless" className={`font-semibold cursor-pointer ${activeTab === "running" ? "bg-blue-50" : ""}`} onClick={() => handleTabClick("running")}>
            Running Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.scheduled ?? '0'} variant="borderless" className={`font-semibold cursor-pointer ${activeTab === "scheduled" ? "bg-blue-50" : ""}`} onClick={() => handleTabClick("scheduled")}>
            Scheduled Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.hold ?? '0'} variant="borderless" className={`font-semibold cursor-pointer ${activeTab === "hold" ? "bg-blue-50" : ""}`} onClick={() => handleTabClick("hold")}>
            Hold Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.completed ?? '0'} variant="borderless" className={`font-semibold cursor-pointer ${activeTab === "completed" ? "bg-blue-50" : ""}`} onClick={() => handleTabClick("completed")}>
            Completed Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.cancelled ?? '0'} variant="borderless" className={`font-semibold cursor-pointer ${activeTab === "cancelled" ? "bg-blue-50" : ""}`} onClick={() => handleTabClick("cancelled")}>
            Cancelled Batches
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
export default BatchCards;