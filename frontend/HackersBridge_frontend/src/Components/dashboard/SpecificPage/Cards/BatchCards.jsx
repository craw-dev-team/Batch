import React from 'react';
import { Card, Col, Row } from 'antd';
import { useBatchForm } from '../../Batchcontext/BatchFormContext';



const BatchCards = ({ handleTabClick, activeTab }) => {

    const { countBatchesByType } = useBatchForm();
    return (
        <Row gutter={[14, 14]}>
          {[
            { key: "all", label: "Total Batches", count: countBatchesByType.all || '0' },
            { key: "running", label: "Running Batches", count: countBatchesByType.running || '0' },
            { key: "scheduled", label: "Scheduled Batches", count: countBatchesByType.scheduled || '0' },
            { key: "hold", label: "Hold Batches", count: countBatchesByType.hold || '0' },
            { key: "completed", label: "Completed Batches", count: countBatchesByType.completed || '0' },
            { key: "cancelled", label: "Cancelled Batches", count: countBatchesByType.cancelled || '0' },
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
export default BatchCards;