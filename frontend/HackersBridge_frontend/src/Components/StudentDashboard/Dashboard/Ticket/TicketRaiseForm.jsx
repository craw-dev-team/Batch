import React from "react";
import { Form, Input, Button, Select, Card, Typography } from "antd";
import { useAllTickets } from "./TicketRaiseContext";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const TicketRaiseForm = ({ onCancel }) => {
  const [form] = Form.useForm();
  const { handleFormSubmit } = useAllTickets();

  const handleSubmit = async (values) => {
    try {
      await handleFormSubmit(values); // Send to server via context
      onCancel()
      form.resetFields();
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };

  return (
    <Card bordered style={{ maxWidth: 800, margin: "0 auto", padding: "0 " }} bodyStyle={{ padding: 10 }}>
      <Title level={4} style={{ marginBottom: 20, padding: 0 }}>
        Raise a Ticket
      </Title>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          label="Issue"
          name="issue"
          rules={[{ required: true, message: "Please select an issue type" }]}
        >
          <Select placeholder="Select issue type">
            <Option value="Book">Books Issue</Option>
            <Option value="Batch">Batches Issue</Option>
            <Option value="Certificate">Certificates Access</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subject"
          rules={[{ required: true, message: "Please enter a subject" }]}
        >
          <Input placeholder="Short summary of the issue" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please describe the issue" }]}
        >
          <TextArea rows={5} placeholder="Describe your issue in detail" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit Ticket
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TicketRaiseForm;
