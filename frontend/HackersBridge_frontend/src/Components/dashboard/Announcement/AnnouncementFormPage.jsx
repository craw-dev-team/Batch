import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Upload,
  Button,
  message,
  Form,
  Input,
  Typography,
  Cascader,
  Divider,
  // Popover,
} from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useAnnouncement } from './AnnouncementContext';
import BASE_URL from '../../../ip/Ip';

const { Title } = Typography;
const { SHOW_CHILD } = Cascader;

const CreateAnnouncementForm = ({ onCancel, selectedAnnouncement }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [cascaderOptions, setCascaderOptions] = useState([]);
  const { trainer, fetchTrainer, resetAnnouncementForm, fetchAnnouncement } = useAnnouncement();

  const isEditing = Boolean(selectedAnnouncement?.id);

  const [linkText, setLinkText] = useState('');
  const [linkURL, setLinkURL] = useState('');
  // const [popoverVisible, setPopoverVisible] = useState(false);


  // Fetch trainer data only once when component mounts
  useEffect(() => {
    fetchTrainer();
  }, []);


  // populate the form field if opening for editing
  useEffect(() => {
    if (selectedAnnouncement) {
      // Transform flat Send_to array into cascader paths
      const toPaths = (selectedAnnouncement.Send_to || []).map(item => {
        // If item is 'all', 'Trainers', or 'Students' (top-level)
        if (item === 'all' || item === 'Trainers' || item === 'Students') {
          return ['all', item];
        }

        // Check if item is a batch_id, find corresponding trainer_id
        for (const t of trainer) {
          if ((t.batches || []).some(batch => batch.batch_id === item)) {
            return ['batches', t.trainer_id, item];
          }
        }

        // Check if item is a trainer_id (no batch)
        if (trainer.some(t => t.trainer_id === item)) {
          return ['batches', item];
        }

        // Default fallback
        return [item];
      });

      form.setFieldsValue({
        subject: selectedAnnouncement.subject || '',
        text: selectedAnnouncement.text || '',
        Send_to: selectedAnnouncement.Send_to || [],
      });
    } else {
      form.resetFields(); 
      setFileList([]);
    }
  }, [selectedAnnouncement, form]);


  useEffect(() => {
    if (!Array.isArray(trainer)) return;

    const trainerWithBatchesOptions = trainer
      .filter(t => t?.trainer_name)
      .map(t => ({
        label: t.trainer_name,
        value: t.trainer_id,
        children: (t.batches || []).map(batch => ({
          label: batch.batch_id,
          value: batch.batch_id,
        })),
      }));

    const dynamicOptions = [
      {
        label: 'All',
        value: 'all',
        children: [
          { label: 'Trainers', value: 'Trainers' },
          { label: 'Students', value: 'Students' },
        ],
      },
      {
        label: 'Batches',
        value: 'batches',
        children: trainerWithBatchesOptions,
      },
    ];

    setCascaderOptions(dynamicOptions);
  }, [trainer]);

  const flattenTo = (nestedTo) => {
    return nestedTo.map(path => (Array.isArray(path) ? path[path.length - 1] : path));
  };

  const handleSubmit = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('User not authenticated.');
      return;
    }

    const flatTo = flattenTo(values.Send_to);
    const formData = new FormData();
    formData.append('subject', values.subject);
    formData.append('text', values.text);
    flatTo.forEach(id => formData.append('Send_to', id));
    fileList.forEach(file => {
      if (file?.originFileObj) {
        formData.append('file', file.originFileObj);
      }
    });
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    try {
      let response;
      if (selectedAnnouncement && selectedAnnouncement.id) {
        response = await axios.put(`${BASE_URL}/api/announcement/edit/${selectedAnnouncement.id}/`, 
          formData, 
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        }
        );
        
        message.success('Announcement Updated Successfully!');
      } else {
        response = await axios.post(`${BASE_URL}/api/announcement/create/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success('Announcement Added Successfully!');
      }
      form.resetFields();
      setFileList([]);
      fetchAnnouncement();
      onCancel();
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Failed to submit the form.');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{
        // backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        // padding: '25px 20px',
        // boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: 800,
        margin: 'auto',
      }}
    >
      <Title level={3}>
       <h6 className='text-lg font-semibold text-gray-900'>{isEditing ? "Edit Announcement" : "Create New Announcement"}</h6>
      <Divider/>
      </Title>

      <Form.Item
        label="To"
        name="Send_to"
        style={{ fontWeight: "400" }}
        // rules={[{ required: true, message: 'Please select at least one recipient' }]}
      >
        <Cascader
          options={cascaderOptions}
          multiple
          maxTagCount="responsive"
          showCheckedStrategy={SHOW_CHILD}
          placeholder="Please select at least one recipient"
          style={{ width: '100%' }}
          showSearch={{
            filter: (inputValue, path) =>
              path.some(opt =>
                opt.label.toLowerCase().includes(inputValue.toLowerCase())
              ),
          }}
          required
        />
      </Form.Item>

      <Form.Item
        label="Subject"
        name="subject"
        // rules={[{  message: 'Please enter a subject' }]}
        style={{ fontWeight: "400" }}
      >
        <Input className='rounded-md border-gray-300' placeholder='Please enter a subject' maxLength={200} required/>
      </Form.Item>

      <Form.Item
        label="Message"
        name="text"
      >
        <div style={{ position: 'relative' }}>
          <Form.Item name="text" style={{ fontWeight: "400" }}>
            <Input.TextArea rows={4} style={{ paddingRight: 40 }} required/>
          </Form.Item>

          {/* <Popover
            content={
              <div style={{ width: 200 }}>
                <Input
                  placeholder="Display Text"
                  size="small"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  style={{ marginBottom: 4 }}
                />
                <Input
                  placeholder="https://example.com"
                  size="small"
                  value={linkURL}
                  onChange={e => setLinkURL(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <Button
                  type="primary"
                  size="small"
                  block
                  onClick={() => {
                    if (!linkURL.trim()) {
                      message.error('Enter a valid URL');
                      return;
                    }
                    const markdownLink = linkText
                      ? `[${linkText.trim()}](${linkURL.trim()})`
                      : linkURL.trim();
                    const prev = form.getFieldValue('text') || '';
                    form.setFieldsValue({ text: `${prev} ${markdownLink}` });
                    setLinkText('');
                    setLinkURL('');
                    setPopoverVisible(false);
                  }}
                >
                  Insert
                </Button>
              </div>
            }
            // title="Insert Link"
            // trigger="click"
            // visible={popoverVisible}
            // onVisibleChange={setPopoverVisible}
          >
            <Button
              type="text"
              icon={<LinkOutlined />}
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: '#16a34a',
                color: 'white',
                borderRadius: '50%',
                padding: 4,
              }}
            />
          </Popover> */}
        </div>
      </Form.Item>

      <Form.Item label="Add Files">
        <Upload
          listType="picture"
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
        >
          <Button icon={<UploadOutlined />} type="primary">
            Upload Files
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <div className='flex gap-10'>

        {/* <Button
          danger
          block
          onClick={() => {
            onCancel?.();
            fetchAnnouncement();
          }}
          >
          Cancel
        </Button> */}
        <Button
          htmlType="submit"
          type="primary"
          block
          style={{ backgroundColor: '#16a34a', marginBottom: 8 }}
          >
          {isEditing ? "Save Changes" : "Submit Announcement"}
        </Button>
          </div>
      </Form.Item>
    </Form>
  );
};

export default CreateAnnouncementForm;
