import React from 'react';
import { Card, Col, Row } from 'antd';
import { useBatchForm } from '../../../Batchcontext/BatchFormContext';



const BatchCards = ({ handleTabClick, activeTab }) => {

    const { batchData } = useBatchForm();
    
    return (
        <Row gutter={[14, 14]}>
          {[
            { key: "all", label: "Total Batches", count: batchData?.results?.all_batch_count || '0' },
            { key: "Running", label: "Running Batches", count: batchData?.results?.running_batch_count || '0' },
            { key: "Scheduled", label: "Scheduled Batches", count: batchData?.results?.upcoming_batch_count || '0' },
            { key: "Hold", label: "Hold Batches", count: batchData?.results?.hold_batch_count || '0' },
            { key: "Completed", label: "Completed Batches", count: batchData?.results?.completed_batch_count || '0' },
            { key: "Cancelled", label: "Cancelled Batches", count: batchData?.results?.cancelled_batch_count || '0' },
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