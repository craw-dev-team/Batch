import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Space,
  Button,
  Modal,
  Descriptions,
} from "antd";
import { useTickets } from "./TicketContext";

const { Title } = Typography;

const TicketsOperation = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { ticketData, fetchTicketData } = useTickets();

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  useEffect(() => {
    fetchTicketData();
  }, []);

  const handleView = (record) => {
    setSelectedTicket(record);
    setDetailModalVisible(true);
  };

  const handleDetailClose = () => {
    setSelectedTicket(null);
    setDetailModalVisible(false);
  };

  const tickets = Array.isArray(ticketData?.ticket)
    ? ticketData.ticket.map((t, index) => ({
        key: t.id || index,
        issue: t.issue_type,
        subject: t.title,
        status: t.status,
        description: t.description,
        createdAt: new Date(t.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      }))
    : [];

  const columns = [
    {
      title: "S.No",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Issue Type",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "geekblue";
        if (status === "Closed") color = "green";
        else if (status === "Open") color = "volcano";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card style={{ margin: "24px" }}>
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="!mb-0">
            All Tickets
          </Title>
          {/* <button
            onClick={showModal}
            className="bg-green-500 px-2 py-1 text-white rounded-md border-green-600 hover:bg-green-400"
          >
            Raise a Ticket
          </button> */}
        </div>

        <Table
          dataSource={tickets}
          columns={columns}
          pagination={{ pageSize: 5 }}
          bordered
        />
      </Card>

      {/* <Modal
        open={isModalVisible}
        onCancel={hideModal}
        footer={null}
        destroyOnClose
      >
        <TicketRaiseForm onCancel={hideModal} />
      </Modal> */}

      <Modal
        title="Ticket Details"
        open={detailModalVisible}
        onCancel={handleDetailClose}
        footer={null}
        width={700}
      >
        {selectedTicket && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Issue Type">
              {selectedTicket.issue}
            </Descriptions.Item>
            <Descriptions.Item label="Subject">
              {selectedTicket.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedTicket.status}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedTicket.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  padding: "8px",
                  backgroundColor: "#fafafa",
                  borderRadius: "4px",
                }}
              >
                {selectedTicket.description}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default TicketsOperation;
