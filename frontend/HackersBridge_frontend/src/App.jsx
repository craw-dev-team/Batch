import { BrowserRouter as Router, Route, Routes  } from "react-router-dom"
import Sidebarnew from "./Components/common/Sidebarnew";
import * as route from './routes/Slugs'
import BatchesHome from "./Pages/BatchesHome";
import StudentsHome from "./Pages/StudentsHome";
import TrainersHome from "./Pages/TrainersHome";
import CoursesHome from "./Pages/CoursesHome";
import { Layout } from "antd";
import Navbar from "./Components/common/Navbar";
import SearchBar from "./Components/common/Searchbar";
import { useEffect, useState } from "react";
import { CourseFormProvider } from "./Components/dashboard/Coursecontext/CourseFormContext";
import { BatchFormProvider } from "./Components/dashboard/Batchcontext/BatchFormContext";
import { StudentFormProvider } from "./Components/dashboard/StudentContext/StudentFormContext";
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
import ProtectedRoute, { PublicRoute } from "./Pages/ProtectedRoute";
import { AuthProvider } from "./Components/dashboard/AuthContext/AuthContext";
import { SpecificBatchProvider } from "./Components/dashboard/Contexts/SpecificBatch";
import SpecificBatchPage from "./Components/dashboard/SpecificPage/SpecificBatchPage";
import StudentsList from "./Components/dashboard/SpecificPage/StudentCardList";
import { SpecificCoordinatorProvider } from "./Components/dashboard/Contexts/SpecificCoordinators";
import SpecificCoordinatorPage from "./Components/dashboard/SpecificPage/SpecificCoordinatorPage";



const { Content, Header } = Layout;

function App() {  
  const [collapsed, setCollapsed] = useState(false);

//   const token = localStorage.getItem("token");

//   axios.get(`$${BASE_URL}/api/trainers/`, {
//     headers: {
//       Authorization: `token ${token}`,
//     },
//   })
//     .then((response) => console.log(response.data))
//     .catch((error) => console.error("Error fetching trainers:", error.response));
  

// useEffect(() => {
//   axios.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         config.headers.Authorization = `token ${token}`;
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );
  
  
// },[])


  return (
    <AppProviders>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            
            {/* Protected Routes including Sidebar & Header */}
            <Route element={<ProtectedRoute />}>
              <Route 
                path="*" 
                element={
                  <Layout>
                    <Sidebarnew collapsed={collapsed} />
                    <Layout>
                      <Header className="sticky top-0 z-50 p-0">
                        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
                        <SearchBar />
                      </Header>
                      <Content className="overflow-auto">
                        <Routes>
                          <Route path={route.BATCHES_PATH} element={<BatchesHome />} />
                          <Route path="/batches/:batchId" element={<SpecificBatchPage />} />
                          <Route path={route.STUDENTS_PATH} element={<StudentsHome />} />
                          <Route path="/students/:studentId" element={<SpecificStudentPage />} />
                          <Route path={route.TRAINERS_PATH} element={<TrainersHome />} />
                          <Route path="/trainers/:trainerId" element={<SpecificTrainerPage />} />
                          <Route path={route.COURSES_PATH} element={<CoursesHome />} />
                          <Route path={route.ADD_DETAILS_COORDINATORS_PATH} element={<CoordinatorsHome />} />
                          <Route path="/add-details/coordinators/:coordinatorId" element={<SpecificCoordinatorPage />} />
                          <Route path={route.ADD_DETAILS_COUNSELLORS_PATH} element={<CounsellorsHome />} />
                          <Route path="/studentsdata/:type" element={<StudentsList />} />
                        </Routes>
                      </Content>
                    </Layout>
                  </Layout>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </AppProviders>
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
                                  {children}
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