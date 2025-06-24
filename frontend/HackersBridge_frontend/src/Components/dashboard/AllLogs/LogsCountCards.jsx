import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';


import { useAllLogs } from '../AllLogsContext/AllLogsContext';

const LogsCountCards = () => {
    const { allLogsData, fetchAllLogs } = useAllLogs();
    
    
    useEffect(() => {
        fetchAllLogs();         
    }, []);
    const coordinatorCounts = allLogsData?.log_counts_by_coordinator ?? [];
    
    return (
        <Row gutter={14}>
            {coordinatorCounts.map(({ actor__username, actor__first_name, actor__id,  log_count }) => (
            <Col span={6} key={actor__id}>
            <Card
                title={actor__first_name || actor__username}
                variant="borderless"
                className="font-semibold cursor-pointer text-blue-500 text-lg mb-2"
            >
                {log_count}
            </Card>
            </Col>
            ))}
      </Row>
    )
}
export default LogsCountCards;