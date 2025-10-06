
// components/StudentStatusDropdown.jsx
import { useState } from "react";
import { Popover, Dropdown, Tag, Button, Input, Tooltip } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { statusDescription } from "./StudentStatusChange";

const StudentStatusDropdown = ({ item, studentStatuses, onChangeStatus }) => {
  const [notePopover, setNotePopover] = useState({
    visible: false,
    studentId: null,
    status: "",
    status_note: "",
  });

  return (
    <Popover
      open={notePopover.visible && notePopover.studentId === item.id}
      onOpenChange={(visible) => {
        if (!visible) {
          setNotePopover((prev) => ({ ...prev, visible: false }));
        }
      }}
      trigger="click"
      placement="bottom"
      content={
        <div className="flex flex-col gap-2 w-64">
          <Input.TextArea
            rows={2}
            placeholder="Enter note..."
            value={notePopover.status_note}
            onChange={(e) =>
              setNotePopover((prev) => ({ ...prev, status_note: e.target.value }))
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              size="small"
              onClick={() =>
                setNotePopover((prev) => ({ ...prev, visible: false }))
              }
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="primary"
              disabled={!notePopover.status_note.trim()}
              onClick={() => {
                onChangeStatus(
                  notePopover.studentId,
                  notePopover.status,
                  notePopover.status_note.trim()
                );
                setNotePopover({
                  visible: false,
                  studentId: null,
                  status: "",
                  status_note: "",
                });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      }
    >
      <Dropdown
        trigger={["click"]}
        menu={{
          items: ["Active", "Inactive", "Temp Block", "Restricted"].map((status) => ({
            key: status,
            label: (
              <Tooltip title={statusDescription[status]} placement="left">
                <span >{status}</span>
              </Tooltip>
            ),
          })),
          onClick: ({ key }) => {
            if (key === "Temp Block" || key === "Restricted") {
              setNotePopover({
                visible: true,
                status: key,
                studentId: item.id,
                status_note: "",
              });
            } else {
              onChangeStatus(item.id, key);
            }
          },
        }}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Tag
          className="rounded-xl"
            color={
              (studentStatuses[item.id] || item.status) === "Active"
                ? "#28a745"
                : (studentStatuses[item.id] || item.status) === "Inactive"
                ? "#6c757d"
                : (studentStatuses[item.id] || item.status) === "Temp Block"
                ? "#ff9100"
                : "#ef233c"
            }
          >
            {studentStatuses[item.id] || item.status} <DownOutlined />
          </Tag>
        </a>
      </Dropdown>
    </Popover>
  );
};

export default StudentStatusDropdown;
