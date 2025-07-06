import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";
import { useStudentAuth } from "../Components/StudentDashboard/Dashboard/StudentAuthContext/StudentAuthContext";
import { Spin } from "antd";




// const PublicRoute = () => {
//   const { token, loading } = useAuth();

//   if (loading) return null; // Prevents flickering during auth check

//   return token ? <Navigate to="/batches" replace /> : <Outlet />;
// };

// export {PublicRoute};




// const ProtectedRoute = () => {
//   const { token, loading } = useAuth();

//   if (loading) return null; // Wait for auth check before rendering

//   return token ? <Outlet /> : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;




// ADMIN PUBLIC ROUTES 
// const PublicRoute = () => {
//   const { token, user, loading } = useAuth();

//   if (loading) return null;

//   if (!token) return <Outlet />;
  
//   // Logged in as admin
//   if (user?.role === "admin") return <Navigate to="/batches" replace />;

//    // Logged in as student
//    if (user?.role === "student") return <Navigate to="/student-info" replace />;

//   return <Navigate to="/" replace />;
// };

// export { PublicRoute };



// ADMIN PROTECTED ROUTES
// const ProtectedRoute = () => {
//   const { token, user, loading } = useAuth();

//   if (loading) return null;

//   // Not logged in? Send to admin login
//   if (!token) return <Navigate to="/" replace />;

//   // Logged in as student? Block admin route & send to student login
//   if (user?.role === "student") return <Navigate to="/" replace />;

//   return <Outlet />;
// };

// export default ProtectedRoute;



// STUDENT PUBLIC ROUTES 
//   const StudentPublicRoute = () => {
//   const { token, user, loading } = useAuth();

//   if (loading) return null;

//   if (!token) return <Outlet />;

//   // Student goes to student dashboard
//   if (user?.role === "student") return <Navigate to="/student-info" replace />;

//   // Admin or other roles go to batches
//   return <Navigate to="/student-info" replace />;
// };

// export {StudentPublicRoute}



// STUDENT PROTECTED ROUTES 
// const StudentRoute = () => {
//   const { token, user, loading } = useAuth();

//   if (loading) return null;

//   // Not logged in? Go to student login
//   if (!token) return <Navigate to="/" replace />;

//   // Logged in as admin? Block access to student dashboard and redirect to admin dashboard
//   if (user?.role !== "student") return <Navigate to="/batches" replace />;

//   return <Outlet />;
// };

// export {StudentRoute};














// NEW

const PublicRoute = () => {
  const { role, loading } = useAuth();

  if (loading) return null;
  
  if (role === "coordinator" || role === "admin") return <Navigate to="/batches" replace />;
  if (role === "student") return <Navigate to="/student-info" replace />;

  return <Outlet />;
};

export { PublicRoute };


  
const ProtectedRoute = () => {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || (role !== "admin" && role !== "coordinator")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute


const StudentRoute = () => {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || role !== "student") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export {StudentRoute};

















// const PublicRoute = () => {
//   const { role, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <Spin size="large" tip="Checking session..." />
//       </div>
//     );
//   }

//   if (role === "admin" || role === "coordinator") return <Navigate to="/batches" replace />;
//   if (role === "student") return <Navigate to="/student-info" replace />;
//   if (role === "trainer") return <Navigate to="/trainer-info" replace />;

//   return <Outlet />;
// };

// export { PublicRoute };



// const ProtectedRoute = () => {
//   const { role, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <Spin size="large" tip="Authenticating..." />
//       </div>
//     );
//   }

//   if (!role || (role !== "admin" && role !== "coordinator")) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;


// const StudentRoute = () => {
//   const { role, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <Spin size="large" tip="Authenticating student..." />
//       </div>
//     );
//   }

//   if (!role || role !== "student") {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export { StudentRoute };



// const TrainerRoute = () => {
//   const { role, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <Spin size="large" tip="Authenticating trainer..." />
//       </div>
//     );
//   }

//   if (!role || role !== "trainer") {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export { TrainerRoute };