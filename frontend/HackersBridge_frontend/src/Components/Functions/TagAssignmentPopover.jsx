import React, { useEffect, useState } from "react";
import { Popover, Button, Select, message } from "antd";
import { TagOutlined } from "@ant-design/icons";
import { useTagContext } from "../dashboard/Tags/TagsContext";
import axiosInstance from "../dashboard/api/api";
import { useTheme } from "../Themes/ThemeContext";

const TagAssignmentPopover = ({ student, isOpen, onOpenChange, setStudentData }) => {
      // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
      // ------------------------------------

  const { handleRemoveTag } = useTagContext();
  const [addTagValue, setAddTagValue] = useState([]);
  const [assignTagData, setAssignTagData] = useState([]);
  const [unassignTagData, setUnassignTagData] = useState([]);



  useEffect(() => {
    if (isOpen && student?.id) {
      fetchAssignTagData(student.id);
    } else {
      setAddTagValue([]);
      setAssignTagData([]);
      setUnassignTagData([]);
    }
  }, [isOpen, student?.id]);



  // Fetch Assigned + Unassigned Tags
  const fetchAssignTagData = async (studentId) => {
    try {
      const res = await axiosInstance.get(`/api/student/assign_tag/${studentId}/`);
      setAssignTagData(res.data?.assigned_tags || []);
      setUnassignTagData(res.data?.unassigned_tags || []);
    } catch (err) {
      console.error("Failed to fetch tag data", err);
    }
  };


  // Add Tags to Student
  const handleAddTag = async (tagIds, studentId) => {
    if (!tagIds.length || !studentId) return;

    try {
      const payload = { tag_ids: tagIds };
      const res = await axiosInstance.post(`/api/student/assign_tag/${studentId}/`, payload);

      if (res.status === 200 || res.status === 201) {
        message.success("Tag added successfully!");
        await fetchAssignTagData(studentId);

        // update tags in UI
        setStudentData((prev) => {
          const updated = prev.results.map((s) =>
            s.id === studentId
              ? { ...s, tags: [...(s.tags || []), ...tagIds] }
              : s
          );
          return { ...prev, results: updated };
        });

        setAddTagValue([]);
      } else {
        message.error("Failed to add tag.");
      }
    } catch (err) {
      console.error("Error adding tags", err);
      message.error("Error adding tag(s).");
    }
  };



  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      open={isOpen}
      onOpenChange={onOpenChange}
      content={
        <div
          className="w-64 space-y-3"
          onMouseEnter={() => clearTimeout(window.__popoverTimer)}
          onMouseLeave={() => {
            window.__popoverTimer = setTimeout(() => {
              onOpenChange(false);
            }, 300);
          }}
        >
          {/* ✅ Assigned Tags */}
          <div className="space-y-1">
            {assignTagData.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 font-medium">Assigned Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {assignTagData.map((tag) => (
                    <div
                      key={tag.id}
                      className="relative text-xs font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: tag.tag_color,
                        color: "#fff",
                        paddingRight: "20px",
                      }}
                    >
                      {tag.tag_name}
                      <span
                        className="absolute top-0 right-0 mr-1 mt-0.5 text-white text-xs cursor-pointer font-bold"
                        onClick={async () => {
                          await handleRemoveTag([tag.id], student.id);
                          setAssignTagData((prev) => prev.filter((t) => t.id !== tag.id));
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-500">No Tags Assigned</span>
            )}
          </div>

          {/* ✅ Tag Select */}
          <div className="flex gap-x-2">
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Tags"
              value={addTagValue}
              onChange={setAddTagValue}
              options={unassignTagData.map((tag) => ({
                value: tag.id,
                label: tag.tag_name,
              }))}
              className="w-full"
              size="small"
              optionRender={(option) => {
                const tag = unassignTagData.find((t) => t.id === option.value);
                return (
                  <div
                    style={{
                      backgroundColor: tag?.tag_color,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                  >
                    {option.label}
                  </div>
                );
              }}
              tagRender={(props) => {
                const { label, value, closable, onClose } = props;
                const tag = unassignTagData.find((t) => t.id === value);
                return (
                  <span
                    style={{
                      backgroundColor: tag?.tag_color,
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      marginRight: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "12px",
                    }}
                  >
                    {label}
                    {closable && (
                      <span
                        onClick={onClose}
                        style={{
                          marginLeft: 6,
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        ×
                      </span>
                    )}
                  </span>
                );
              }}
            />
            <button
              type="button"
              className={`h-7 cursor-pointer focus:outline-none text-white font-medium rounded-lg text-sm px-2 py-1 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}
              disabled={!addTagValue || addTagValue.length === 0}
              onClick={async () => {
                await handleAddTag(addTagValue, student.id);
              }}
            >
              Add
            </button>
          </div>
        </div>
      }
    >
      <TagOutlined
        className="cursor-pointer text-gray-600 hover:text-black"
        onClick={() => onOpenChange(!isOpen)}
      />
    </Popover>
  );
};

export default TagAssignmentPopover;
