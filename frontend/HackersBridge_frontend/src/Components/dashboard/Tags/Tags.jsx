import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Button, Popconfirm, Empty, Typography } from "antd";
import { useTagContext } from "./TagsContext"; 
import { DeleteOutlined } from "@ant-design/icons"
import { useTheme } from "../../Themes/ThemeContext";

const { Title } = Typography;


const Tags = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

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
      <div className={`relative w-full h-full shadow-md rounded-xl p-4 mt-1 ${theme.specificPageBg}`}>
        <div className={`w-full px-1 py-3 flex justify-between items-center font-semibold ${theme.text}`}>
          <h1>All Tags</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}
          >
            Add Tag +
          </button>
        </div>

        {/* <div className="overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm"> */}
          <div className="overflow-y-auto h-[37rem] md:max-h-[36rem] 2xl:max-h-[37rem] bg-white/40 backdrop-blur-sm rounded-xl shadow-sm pb-2">
            <table className="w-full text-xs font-normal text-left text-gray-600">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="bg-gray-50/80">
                  <th className="px-3 py-2 md:px-1 text-xs font-medium uppercase">S.No</th>
                  <th className="px-3 py-2 md:px-1 text-xs font-medium uppercase">Tag Name</th>
                  <th className="px-3 py-2 md:px-1 w-[400px] max-w-[500px] text-xs font-medium uppercase">Description</th>
                  <th className="px-3 py-2 md:px-1 text-xs font-medium uppercase">Created By</th>
                  <th className="px-3 py-2 md:px-1 text-xs font-medium uppercase">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
              {tagData?.data && tagData?.data.length > 0 ? (
                  tagData?.data.map((tag, index) => (
                    <tr key={tag.id} className="hover:bg-gray-50 transition-colors scroll-smooth">
                      <td className="px-3 py-2 md:px-2">{index + 1}</td>
                      <td className="px-3 py-2 md:px-1">
                      <span className="relative inline-block text-white font-medium">
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
                        <td className="px-3 py-2 md:px-1 font-normal w-[300px] max-w-[300px] break-words">
                            {tag.tag_description}
                        </td>
                      <td className="px-3 py-2 md:px-1 font-normal">{tag.created_by || "N/A"}</td>
                      <td className="px-3 py-2 md:px-1">
                        <Popconfirm
                            title="Are you sure to delete this tag?"
                            onConfirm={() => deleteTag(tag.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                        <Button 
                            color="danger" 
                            variant="filled" 
                            className="rounded-xl w-auto px-3"
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
        {/* </div> */}
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
