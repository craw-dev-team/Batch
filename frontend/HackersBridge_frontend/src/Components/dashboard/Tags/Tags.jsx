import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Button, Popconfirm, Empty, Typography } from "antd";
import { useTagContext } from "./TagsContext"; 
import { TagOutlined, DeleteOutlined } from "@ant-design/icons"

const { Title } = Typography;


const Tags = () => {
  const { handleTagSubmit, fetchTagData, tagData, deleteTag } = useTagContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddTag = () => {
    form
      .validateFields()
      .then((values) => {
        handleTagSubmit(values);
        form.resetFields();
        setIsModalOpen(false);
      })
      .catch((err) => console.log("Validation Error:", err));
  };

  useEffect(()=>{
    fetchTagData();
  },[]);


  return (
    <>
      <div className="relative w-full h-full mt-5 shadow-md sm:rounded-lg border border-gray-50 dark:border-gray-600">
        <div className="w-full px-4 py-3 text flex justify-between font-semibold">
          <h1>All Tags</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="focus:outline-none text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm px-4 py-1.5"
          >
            Add Tag <TagOutlined />
          </button>
        </div>

        <div className="overflow-hidden pb-2 relative">
          <div className="w-full h-[30rem] overflow-y-auto rounded-lg pb-2">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3">S.No</th>
                  <th className="px-3 py-3">Tag Name</th>
                  <th className="px-0 py-3 w-[450px]">Description</th>
                  <th className="px-7 py-3">Created By</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
              {tagData?.data && tagData?.data.length > 0 ? (
                  tagData?.data.map((tag, index) => (
                    <tr key={tag.id} className="bg-white border-b">
                      <td className="px-3 py-2 font-medium text-gray-900 ">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-sm">
                      <span className="relative inline-block text-white font-semibold">
                        {/* Tag Shape */}
                        <span
                            className="inline-block px-4 py-1 pl-6 rounded-r-md"
                            style={{
                            backgroundColor: tag.tag_color,
                            clipPath:
                                "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)",
                            }}
                        >
                            {tag.tag_name}
                        </span>

                        {/* Circle hole on the left */}
                        <span className="absolute top-1/2 left-2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-inner" />
                        </span>
                        </td>
                        <td className="px-0 py-2 font-medium w-[300px] max-w-[300px] break-words">
                            {tag.tag_description}
                        </td>
                      <td className="px-7 py-2 font-medium">{tag.created_by || "N/A"}</td>
                      <td className="px-3 py-2">
                        <Popconfirm
                            title="Are you sure to delete this tag?"
                            onConfirm={() => deleteTag(tag.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                        <Button 
                            color="danger" 
                            variant="filled" 
                            className="rounded-lg w-auto px-3"
                        >
                        <DeleteOutlined />
                        </Button>
                        </Popconfirm>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="100%" className="text-center py-4 text-gray-500">
                      <Empty description="No Tags found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        okText="Add Tag"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddTag}
        destroyOnClose
        okButtonProps={{
          style: {
            backgroundColor: '#0e9f6e', 
            borderColor: '#0e9f6e',
            color: '#fff',
          },
        }}
      >
        <Title level={4} style={{ marginBottom: 10, padding: 0, fontSize: '18px' }}>
          Add Tag
        </Title>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[{ required: true, message: "Please enter tag name" }]}
          >
            <div className="relative">
              <Input
                size="small"
                placeholder="Enter Tag Name"
                className="pr-12 h-8 text-sm text-black rounded-md focus:ring-0 border border-gray-300"
              />
              {/* <input0
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-6 h-6 border-none cursor-pointer p-0 shadow"
                style={{ appearance: "none" }}
              /> */}
            </div>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter Description" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Tags;
