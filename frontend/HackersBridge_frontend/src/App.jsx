import { BrowserRouter as Router, Route, Routes  } from "react-router-dom"
import Sidebarnew from "./Components/common/Sidebarnew";
import * as route from './routes/Slugs'
import BatchesHome from "./Pages/BatchesHome";
import StudentsHome from "./Pages/StudentsHome";
import TrainersHome from "./Pages/TrainersHome";
import CoursesHome from "./Pages/CoursesHome";
import { Layout, Spin } from "antd";
import { useState } from "react";
import { CourseFormProvider } from "./Components/dashboard/Coursecontext/CourseFormContext";
import { BatchFormProvider } from "./Components/dashboard/Batchcontext/BatchFormContext";
import { StudentFormProvider } from "./Components/dashboard/Studentcontext/StudentFormContext";
import { TrainerFormProvider } from "./Components/dashboard/Trainercontext/TrainerFormContext";
import { CoordinatorFormProvider } from "./Components/dashboard/AddDetails/Coordinator/CoordinatorContext";
import { CounsellorFormProvider } from "./Components/dashboard/AddDetails/Counsellor/CounsellorContext";
import CoordinatorsHome from "./Pages/AddDetailsHome.jsx/CoordinatorsHome";
import CounsellorsHome from "./Pages/AddDetailsHome.jsx/CounsellorsHome";
import { SpecificTrainerProvider } from "./Components/dashboard/Contexts/SpecificTrainers";
import SpecificTrainerPage from "./Components/dashboard/SpecificPage/SpecificTrainerPage";
import SpecificStudentPage from "./Components/dashboard/SpecificPage/SpecificStudentPage";
import { SpecificStudentProvider } from "./Components/dashboard/Contexts/SpecificStudent";
import Login, { ForgotPassword, ResetPassword, VerifyOTP } from "./Pages/Login";
import Register from "./Pages/Register";
import ProtectedRoute, { PublicRoute, StudentRoute, TrainerRoute } from "./Pages/ProtectedRoute";
import { AuthProvider, useAuth } from "./Components/dashboard/AuthContext/AuthContext";
import { SpecificBatchProvider } from "./Components/dashboard/Contexts/SpecificBatch";
import SpecificBatchPage from "./Components/dashboard/SpecificPage/SpecificBatchPage";
import { SpecificCoordinatorProvider } from "./Components/dashboard/Contexts/SpecificCoordinators";
import SpecificCoordinatorPage from "./Components/dashboard/SpecificPage/SpecificCoordinatorPage";
import AllLogs from "./Components/dashboard/AllLogs/AllLogs";
import { AllLogsProvider } from "./Components/dashboard/AllLogsContext/AllLogsContext";
import BooksHome from "./Pages/BooksHome";
import { BookFormProvider } from "./Components/dashboard/BooksContext/BookFormContext";
import StudentDashboardHome from "./Components/StudentDashboard/Pages/StudentDashboardHome";
import { SpecificCourseProvider } from "./Components/dashboard/Contexts/SpecificCourse";
import SpecificCoursePage from "./Components/dashboard/SpecificPage/SpecificCoursePage";
import DashboardLayout from "./Components/common/DashboardLayout";
import StudentBatchChat from "./Components/StudentDashboard/Dashboard/StudentInfo/Chat/StudentBatchChat";
import StudentBatches from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentBatches/StudentBatches";
import StudentAttendance from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentAttendance/StudentAttendance";
import StudentBatchInfo from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentBatches/StudentBatchesInfo";
import { StudentBatchProvider } from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentBatches/StudentBatchContext";
import StudentRecommendedBatches from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentBatches/StudentRecommendedBatches";
import { StudentAttendanceProvider } from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentAttendance/StudentAttendanceContext";
import { RequestBatchProvider } from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentBatches/RequestBatch/RequestBatchContext";
import { StudentCertificateProvider } from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentCertificate/StudentCertificateContext";
import AllTickets from "./Components/StudentDashboard/Dashboard/Ticket/AllTickets";
import StudentCertificate from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentCertificate/StudentCertificate";
import CreateAnnouncementForm from "./Components/dashboard/Announcement/AnnouncementFormPage";
import AnnouncementPage from "./Components/dashboard/Announcement/AnnouncementPage";
import { AnnouncementProvider } from "./Components/dashboard/Announcement/AnnouncementContext";
import TicketsOperation from "./Components/dashboard/Tickets/TicketsOperation";
import { TicketsProvider } from "./Components/dashboard/Tickets/TicketContext";
import PageNotFound from "./Pages/PageNotFound";
import SpecificBookPage from "./Components/dashboard/SpecificPage/SpecificBookPage";
import { SpecificBookProvider } from "./Components/dashboard/Contexts/SpecificBook";
import { StudentInfoProvider } from "./Components/StudentDashboard/Dashboard/StudentInfo/StudentDetails/StudentInfoContext";
import { BatchChatsProvider } from "./Components/dashboard/Chat/BatchChatsContext";
import BatchChats from "./Components/dashboard/Chat/BatchChats";
import BookCardList from "./Components/dashboard/SpecificPage/Cards/Book/BookCardList";
import StudentsList from "./Components/dashboard/SpecificPage/Cards/Student/StudentCardList";
import { AllTicketsProvider } from "./Components/StudentDashboard/Dashboard/Ticket/TicketRaiseContext";
import { TagProvider } from "./Components/dashboard/Tags/TagsContext";
import { TimeSlotProvider } from "./Components/dashboard/AddDetails/TimeSlot/TimeSlotContext";
import TrainersList from "./Components/dashboard/SpecificPage/Cards/Trainer/TrainerCardList";
import StudentLayout from "./Components/StudentDashboard/Dashboard/Common/StudentLayout";
import TrainerLayout from './Components/TrainerDashboard/dashboard/common/TrainerLayout';
import TrainerDashboardHome from './Components/TrainerDashboard/Pages/TrainerDashboardHome';
import TrainerBatches from './Components/TrainerDashboard/dashboard/TrainerInfo/TrainerBatches/TrainerBatches';
import TrainerBatchesInfo from './Components/TrainerDashboard/dashboard/TrainerInfo/TrainerBatches/TrainerBatchesInfo';
import TrainerBatchChats from './Components/TrainerDashboard/dashboard/TrainerChat/TrainerChat';
import { TrainerInfoProvider } from "./Components/TrainerDashboard/dashboard/TrainerInfo/TrainerDetails/TrainerInfoContext";
import { TrainerBatchProvider } from "./Components/TrainerDashboard/dashboard/TrainerInfo/TrainerBatches/TrainerBatchesContext";
import { TrainerBatchChatsProvider } from "./Components/TrainerDashboard/dashboard/TrainerChat/TrainerbatchChatFunctions";
import TrainerAnnouncement from './Components/TrainerDashboard/dashboard/TrainerInfo/Announcement/TrainerAnnouncementPage';



const { Content, Header } = Layout;

function App() {  

    const [collapsed, setCollapsed] = useState(true);

;

  return (
      <AuthProvider>
        <AppProviders>
          <Router>
            <Routes>

              {/* ADMIN/COORDINATOR PUBLIC ROUTES */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<Login />} />
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* STUDENT PROTECTED ROUTES */}
              <Route element={<StudentRoute />}>
                <Route path="/student-info" element={<StudentLayout />}>
                  <Route index element={<StudentDashboardHome />} />
                  <Route path="student-batches" element={<StudentBatches />} />
                  <Route path="student-recommended-batches" element={<StudentRecommendedBatches />} />
                  <Route path="student-batches/:batchId" element={<StudentBatchInfo />} />
                  <Route path="student-attendance" element={<StudentAttendance />} />
                  <Route path="student-chat" element={<StudentBatchChat />} />
                  <Route path="student-certificates" element={<StudentCertificate />} />
                  <Route path="all-tickets" element={<AllTickets />} />
                  {/* <Route path="student-announcement-page" element={<StudentAnnouncementPage />} /> */}
                </Route>
                <Route path="*" element={<PageNotFound />} />
              </Route>

              {/* TRAINER PROTECTED ROUTES */}
              <Route element={<TrainerRoute />}>
                <Route path="/trainer-info" element={<TrainerLayout />}>
                  <Route index element={<TrainerDashboardHome />} />
                  <Route path="trainer-batches" element={<TrainerBatches />} />
                  {/* <Route path="student-recommended-batches" element={<StudentRecommendedBatches />} /> */}
                  <Route path="trainer-batches/:batchId" element={<TrainerBatchesInfo />} />
                  <Route path="trainer-chat" element={<TrainerBatchChats />} />
                  {/* <Route path="student-certificates" element={<StudentCertificate />} /> */}
                  {/* <Route path="all-tickets" element={<AllTickets />} /> */}
                  <Route path="trainer-announcement" element={<TrainerAnnouncement />} />
                </Route>
                <Route path="*" element={<PageNotFound />} />
              </Route>

              {/* ADMIN/COORDINATOR PROTECTED ROUTES */}
              <Route element={<ProtectedRoute  />}>
                <Route
                  element={<DashboardLayout collapsed={collapsed} setCollapsed={setCollapsed} />}>
                  <Route path={route.BATCHES_PATH} element={<BatchesHome />} />
                  <Route path="/batches/:batchId" element={<SpecificBatchPage />} />
                  <Route path={route.STUDENTS_PATH} element={<StudentsHome />} />
                  <Route path="/students/:studentId" element={<SpecificStudentPage />} />
                  <Route path={route.TRAINERS_PATH} element={<TrainersHome />} />
                  <Route path="/trainers/:trainerId" element={<SpecificTrainerPage />} />
                  <Route path="/trainersdata/:type" element={<TrainersList />} />
                  <Route path={route.COURSES_PATH} element={<CoursesHome />} />
                  <Route path="/course/:courseId" element={<SpecificCoursePage />} />
                  <Route path={route.ADD_DETAILS_COORDINATORS_PATH} element={<CoordinatorsHome />} />
                  <Route path="/add-details/coordinators/:coordinatorId" element={<SpecificCoordinatorPage />} />
                  <Route path={route.ADD_DETAILS_COUNSELLORS_PATH} element={<CounsellorsHome />} />
                  <Route path="/studentsdata/:type" element={<StudentsList />} />
                  <Route path={route.ALL_LOGS_PATH} element={<AllLogs />} />
                  <Route path={route.BOOKS_PATH} element={<BooksHome />} />
                  <Route path="/book/:bookId" element={<SpecificBookPage />} />
                  <Route path="/book/card/:course_name" element={<BookCardList />} />
                  <Route path="announcement-form-page" element={<CreateAnnouncementForm />} />
                  <Route path={route.ANNOUNCEMENTS_PATH} element={<AnnouncementPage />} />
                  <Route path={route.TICKETS_PATH} element={<TicketsOperation />} />
                  <Route path={route.BATCH_CHAT_PATH} element={<BatchChats/>} />
                <Route path="*" element={<PageNotFound />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </AppProviders>
      </AuthProvider>
  );
}

export default App;


 
const AppProviders = ({ children }) => {



  return (
      <CourseFormProvider>
          <BatchFormProvider>
              <StudentFormProvider>
                  <TrainerFormProvider>
                      <CoordinatorFormProvider>
                        <CounsellorFormProvider>
                          <SpecificTrainerProvider>
                            <SpecificStudentProvider>
                              <SpecificBatchProvider>
                                <SpecificCoordinatorProvider>
                                  <SpecificCourseProvider>
                                    <AllLogsProvider>
                                      <BookFormProvider>
                                        <StudentAttendanceProvider>
                                          <StudentBatchProvider>
                                            <RequestBatchProvider>
                                              <StudentCertificateProvider>
                                                <AllTicketsProvider>
                                                  <AnnouncementProvider>
                                                    <TicketsProvider>
                                                      <SpecificBookProvider>
                                                        <StudentInfoProvider>
                                                          <BatchChatsProvider>
                                                            <TagProvider>
                                                              <TimeSlotProvider>
                                                                <TrainerInfoProvider>
                                                                  <TrainerBatchProvider>
                                                                    <TrainerBatchChatsProvider>
                                                                      {children}
                                                                    </TrainerBatchChatsProvider>
                                                                  </TrainerBatchProvider>
                                                                </TrainerInfoProvider>
                                                              </TimeSlotProvider>
                                                            </TagProvider>
                                                          </BatchChatsProvider>
                                                        </StudentInfoProvider>
                                                      </SpecificBookProvider>
                                                    </TicketsProvider>
                                                  </AnnouncementProvider>
                                                </AllTicketsProvider>
                                              </StudentCertificateProvider>
                                            </RequestBatchProvider>
                                          </StudentBatchProvider>
                                        </StudentAttendanceProvider>
                                      </BookFormProvider>
                                    </AllLogsProvider>
                                  </SpecificCourseProvider>
                                </SpecificCoordinatorProvider>
                              </SpecificBatchProvider>
                            </SpecificStudentProvider>
                          </SpecificTrainerProvider>
                        </CounsellorFormProvider>
                      </CoordinatorFormProvider>
                  </TrainerFormProvider>
              </StudentFormProvider>
          </BatchFormProvider>
      </CourseFormProvider>
  );
};







// function App() {

//   return (
//     <>
//     <BrowserRouter>
//       <AppContent />
//     </BrowserRouter>
//     </>
//   )
// }



// function AppContent() {
//   return (
//     <>
//       <Sidebar/>
//     {/* <Routes> */}
//       {/* <Route path={route.BATCHES_PATH} element={<BatchesHome />} /> */}
//       {/* <Route path={route.STUDENTS_PATH} element={<StudentsHome />} />
//       <Route path={route.TRAINERS_PATH} element={<TrainersHome />} /> */}
//       {/* </Routes> */}
//     </>

//   )
// }

// export default App




// function App() {  
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <>
//     <AppProviders>
//     <AuthProvider>
//      <Router>
//       <Layout >

//         {/* Sidebar remains fixed */}
//         <Sidebarnew collapsed={collapsed} />

//         {/* Main Layout */}
//         <Layout className="">
//           <Header className="sticky top-0 z-50 p-0">
//             <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
//             <SearchBar />
//           </Header>
          
//           {/* Content area for rendering pages */}
//           <Content className="overflow-auto">
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />

//               <Route element={<ProtectedRoute />}>
//               <Route path={route.BATCHES_PATH} element={<BatchesHome />} />
//               {/* <Route path={route.TRAINER_DETAILS_PATH} element={<SpecificTrainerPage/>} /> */}
//               <Route path="/trainers/:trainerId" element={<SpecificTrainerPage/>} />
//               <Route path={route.STUDENTS_PATH} element={<StudentsHome />} />
//               <Route path="/students/:studentId" element={<SpecificStudentPage/>} />
//               <Route path={route.TRAINERS_PATH} element={<TrainersHome />} />
//               <Route path={route.COURSES_PATH} element={<CoursesHome />} />
//               <Route path={route.ADD_DETAILS_COORDINATORS_PATH} element={<CoordinatorsHome />} />
//               <Route path={route.ADD_DETAILS_COUNSELLORS_PATH} element={<CounsellorsHome />} />
//               </Route>
//             </Routes>
//           </Content>
//         </Layout>
//       </Layout>
//     </Router>
//     </AuthProvider>
//     </AppProviders>
//     </>
//   )
// };

// export default App;