import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Card, Typography, Modal } from "antd";
import { useAllTickets } from "./TicketRaiseContext";

import ReCAPTCHA from 'react-google-recaptcha';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const TicketRaiseForm = ({ onCancel }) => {
  const [form] = Form.useForm();
  const { ticketData, handleFormSubmit } = useAllTickets();
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const user = ticketData?.user_info || { name: "", email: "" };

  useEffect(() => {
    // Set default values when the form mounts
    form.setFieldsValue({
      username: user.name,
      email: user.email,
    });
  }, [user, form]);

  const handleSubmit = async (values, recaptchaToken) => {        
    try {
      await handleFormSubmit(values, recaptchaToken); // Send to server via context
      onCancel()
      form.resetFields();
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };

  return (
    // <Modal bordered style={{ maxWidth: 800, margin: "0", padding: "0" }} styles={{ body: { padding: 8 } }}>
      <>
      <Title level={4} style={{ marginBottom: 10, padding: 0, fontSize: '18px' }}>
        Raise a Ticket
      </Title>
      <Form layout="vertical" form={form} onFinish={(values) => handleSubmit(values, recaptchaToken)} requiredMark={false}>

        {/* <Form.Item label="Username" name="username">
          <Input disabled className='rounded-md h-8 text-sm focus:ring-0 hover:border-[#10b07b] focus:border-[#10b07b] border-gray-300'/>
        </Form.Item> */}

        {/* <Form.Item label="Email" name="email">
          <Input disabled className='rounded-md h-8 text-sm focus:ring-0 hover:border-[#10b07b] focus:border-[#10b07b] border-gray-300'/>
        </Form.Item> */}

        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
          label="Issue Type"
          name="issue_type"
          rules={[{ required: true, message: "Please select an issue type" }]}
        >
          <Select placeholder="Select Issue Type" className="custom-green-select">
            <Option value="Book">Books Issue</Option>
            <Option value="Batch">Batches Issue</Option>
            <Option value="Certificate">Certificates Access</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true, message: "Please select priority" }]}
        >
          <Select placeholder="Select Priority" className="custom-green-select">
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Form.Item>
        </div>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please Enter Title" }]}
        >
          <Input placeholder="Short Summary Of The Issue"  className='rounded-md h-8 text-sm focus:ring-0 hover:border-[#10b07b] focus:border-[#10b07b] border-gray-300'/>
        </Form.Item>

        <Form.Item
          label="Description"
          name="message"
          rules={[{ required: true, message: "Please describe the issue" }]}
        >
          <TextArea rows={5} placeholder="Describe Your Issue In Detail" className="focus:ring-0 hover:border-[#10b07b] focus:border-[#10b07b] border-gray-300"/>
        </Form.Item>

        <Form.Item>
          <div style={{ transform: "scale(0.7)", transformOrigin: "0 0" }}>
          <ReCAPTCHA
            sitekey="6Le71r0rAAAAAAN9fwpdRSDr2yL_mFblxpcWaPZ7"
            onChange={(token) => setRecaptchaToken(token)}
          />
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: "#0e9f6e", borderColor: "#0e9f6e", hover: "#0c7d57" }} block>
            Submit Ticket
          </Button>
        </Form.Item>
      </Form>
      </>
    // </Modal>
  );
};

export default TicketRaiseForm;
