import React, { useEffect } from "react";
import { Timeline, Card, Tag } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  MessageOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useSpecificStudent } from "../Contexts/SpecificStudent";

// Custom icon for alumni
const GraduationIcon = () => (
  <img
    src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
    alt="icon"
    className="w-5 h-5"
  />
);

// Sample helper to choose icon (customize per note type)
const getIcon = (type) => {
  switch (type) {
    case "alumni":
      return <GraduationIcon />;
    case "coordination":
      return <MessageOutlined />;
    case "attendance":
      return <CheckCircleOutlined />;
    default:
      return <UserOutlined />;
  }
};

// Group notes by month
export const groupNotesByMonth = (notes) => {
    const grouped = {};
  
    notes.forEach((note) => {
      const date = dayjs(note.last_update_datetime || new Date());
      const key = date.format("MMM YY");
  
      if (!grouped[key]) grouped[key] = [];
  
      grouped[key].push({
        date: date.toISOString(),
        type: "note",
        content: note.note,
        label: note.create_by__role || "System Note",
        username: note.create_by__first_name || "Unknown",
      });
    });
  
    return grouped;
  };


// Main Component
const SpecificStudentNotes = () => {
  const { specificStudent, loading, fetchSpecificStudent } = useSpecificStudent();
  const { studentId } = useParams();

  const { student_notes } = specificStudent?.All_in_One || {};

  useEffect(() => {
    if (studentId) {
      try {
        const originalStudentId = atob(studentId);
        fetchSpecificStudent(originalStudentId);
      } catch (error) {
        console.error("Error decoding student ID:", error);
      }
    }
  }, [studentId]);

  if (loading) return <p className="text-center text-gray-500">Loading notes...</p>;

  if (!student_notes?.length) return <p className="text-center text-gray-500">No notes found.</p>;

  const groupedNotes = groupNotesByMonth(student_notes);

  return (
    <div className="w-auto mt-0 bg-white">
        <div className="relative w-full h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
            <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                <h1>Notes</h1>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" tip="Loading notes..." />
              </div>
            ) : groupedNotes?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Empty description="No notes found." />
              </div>
            ) : (
              Object.entries(groupedNotes).map(([monthLabel, notes]) => (
                <div key={monthLabel} className="mb-8">
                  <h3 className="px-4 mt-4 text-lg font-semibold text-gray-700 mb-4">
                    {monthLabel}
                  </h3>
                  <Timeline
                    mode="alternate"
                    className="pl-2"
                    items={notes.map((note, idx) => ({
                      key: idx,
                      dot: getIcon(note.type),
                      label: (
                        <div className="text-xs text-gray-500">
                          {dayjs(note.date).format("ddd, DD")} <br />
                          {dayjs(note.date).format("hh:mm A")}
                        </div>
                      ),
                      children: (
                        <Card size="small" bordered className="bg-white shadow-sm mr-5">
                          <div className="mb-1 flex items-center gap-2">
                            {note.label && <Tag color="blue">{note.label}</Tag>}
                            {note.username && (
                              <span className="text-xs text-gray-500 italic">
                                by {note.username}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-800">{note.content}</p>
                        </Card>
                      ),
                    }))}
                  />
                </div>
              ))
            )}

        </div>
    </div>
  );
};

export default SpecificStudentNotes;
