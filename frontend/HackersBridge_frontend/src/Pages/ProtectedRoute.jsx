import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";
import { useStudentAuth } from "../Components/StudentDashboard/Dashboard/StudentAuthContext/StudentAuthContext";




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
  
  if (role === "admin") return <Navigate to="/batches" replace />;
  if (role === "student") return <Navigate to="/student-info" replace />;

  return <Outlet />;
};

export { PublicRoute };





  
const ProtectedRoute = () => {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || role !== "admin") {
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