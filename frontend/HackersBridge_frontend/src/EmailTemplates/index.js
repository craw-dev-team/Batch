import welcomeTemplate from './welcomeTemplate';
import BatchStart from './BatchStart';
import BatchComplete from './BatchComplete';
import Batchcancel from './BatchCancel';
import AttendanceWarning from './AttendanceWarning';
import ExamAnnouncement from './ExamAnnouncment';
import CustomTemplate from './CustomTemplate';
import BatchTerminate from './BatchTerminate';

// ✅ Central utility function
export const to12HourFormat = (time) => {
  if (!time) return "N/A";
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(+hour, +minute);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const templates = {
  "Welcome": welcomeTemplate,
  "Batch Start": BatchStart,
  "Batch Complete": BatchComplete,
  "Batch Cancel": Batchcancel,
  "Attendance Warning": AttendanceWarning,
  "Batch Termination" : BatchTerminate,
  "Exam Announcement": ExamAnnouncement,
  "Custom Template": CustomTemplate,
};

export default templates;
