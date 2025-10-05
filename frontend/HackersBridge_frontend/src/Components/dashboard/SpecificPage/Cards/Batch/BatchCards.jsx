import React from 'react';
import { Card, Col, Row } from 'antd';
import { useBatchForm } from '../../../Batchcontext/BatchFormContext';

import { useTheme } from "../../../../Themes/ThemeContext.jsx";


const BatchCards = ({ handleTabClick, activeTab }) => {
  const { getTheme } = useTheme();
  const theme = getTheme();

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
          ].map(({ key, label, count }, index) => (
            <Col span={4} key={key}>
              <Card
                title={<span className={`text-${theme.cards[index]} text-2xl`}>{count}</span>}
                variant="bordered"
                className={`rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 font-bold opacity-80 ${theme.cards[index] || ""} ${
                  key !== "all" ? "cursor-pointer" : "cursor-default"
                }
                  ${activeTab === key && key !== "all" ? `${theme.cards[index]} border-2 opacity-100` : ""
                  }`}
                styles={{
                  header: {
                    padding: '2px 8px',
                    height: '28px',
                    // backgroundColor: '#ebf5ff',
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