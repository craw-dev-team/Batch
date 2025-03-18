import React from 'react';
import { Card, Col, Row } from 'antd';
import { useBatchForm } from '../Batchcontext/BatchFormContext';



const BatchCards = () => {

    const { countBatchesByType } = useBatchForm();
    return (
        <Row gutter={14}>
        <Col span={4}>
          <Card title={countBatchesByType.all || '0'} variant="borderless">
            Total Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title= {countBatchesByType.running || '0'} variant="borderless">
            Running Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.scheduled || '0'} variant="borderless">
            Scheduled Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.hold || '0'} variant="borderless">
          Hold Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.completed || '0'} variant="borderless">
            Completed Batches
          </Card>
        </Col>
        <Col span={4}>
          <Card title={countBatchesByType.cancelled || '0'} variant="borderless">
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