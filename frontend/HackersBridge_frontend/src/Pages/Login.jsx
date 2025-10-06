// import React,{ useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";
// import { message, Input } from "antd";
// import { EyeOutlined, EyeInvisibleOutlined, UserOutlined, LockOutlined, LeftOutlined, MailOutlined } from '@ant-design/icons';
// import crawlogo from "../assets/images/crawlogo.png"
// import ReCAPTCHA from 'react-google-recaptcha';
// // import { requestFCMToken } from "../Firebase/fcm.js"; // ✅ FCM service
// import { requestFCMToken, onMessageListener } from "../Firebase/fcm.js"; // ✅ FCM service
// import axios from "axios";
// import BASE_URL from "../ip/Ip.jsx";
// import GlobalNotification from "../Components/dashboard/Notification/NotificationForeGroundPopup.jsx";
// // import useNotification from "antd/es/notification/useNotification.js";
// import { useNotification } from "../Components/dashboard/Notification/NotificationContext.jsx";
// // import axiosInstance from "../Components/dashboard/api/api.js";

// const Login = () => {
//   const [credentials, setCredentials] = useState({ username: "", password: "" });
//   const { loading, setLoading, universalLogin } = useAuth();
//   const navigate = useNavigate();
//   const [showpass, setShowpass] = useState(false);
//   const [recaptchaToken, setRecaptchaToken] = useState(null);
//   const { fetchNotification, notification } = useNotification


//   const handleChange = (e) =>
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });


//   // const handleLogin = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     // 1️⃣ Login API call
//   //     const response = await universalLogin(
//   //       credentials.username,
//   //       credentials.password,
//   //       recaptchaToken
//   //     );

//   //     const role = response?.user_info?.role?.toLowerCase();

//   //     if (!role) {
//   //       return message.error("Invalid login response");
//   //     }

//   //     message.success("Login successful");

//   //     // 2️⃣ Fetch and show unread notifications
//   //     try {
//   //       const notifications = await fetchNotification();
//   //       notifications.forEach((notif) => {
//   //         GlobalNotification.show(notif.title, notif.description, notif.link, 5); // duration in seconds
//   //       });

//   //       // Optional: show a welcome notification
//   //       GlobalNotification.show("New Notification", "Your campaign has been published!",  "https://google.com", 5);
//   //     } catch (notifErr) {
//   //       console.error("Failed to fetch notifications:", notifErr);
//   //     }

//   //     // 3️⃣ Request & send FCM token
//   //     try {
//   //       const fcmToken = await requestFCMToken();
//   //       if (fcmToken) {
//   //         console.log("✅ Got FCM token:", fcmToken);
//   //         await axiosInstance.post(`/api/save-fcm-token/`, { token: fcmToken });
//   //         listenForMessages();
//   //       }
//   //     } catch (fcmErr) {
//   //       console.error("❌ FCM setup failed:", fcmErr);
//   //     }

//   //     // 4️⃣ Navigate based on role
//   //     switch (role) {
//   //       case "admin":
//   //       case "coordinator":
//   //         navigate("/batches");
//   //         break;
//   //       case "student":
//   //         navigate("/student-info");
//   //         break;
//   //       case "trainer":
//   //         navigate("/trainer-info");
//   //         break;
//   //       default:
//   //         message.error("Unknown role!");
//   //     }
//   //   } catch (err) {
//   //     console.error("Login failed:", err);
//   //     message.error("Login failed. Please check credentials.");
//   //   }
//   // };



//    const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       // 1️⃣ Login API call
//       const response = await universalLogin(
//         credentials.username,
//         credentials.password,
//         recaptchaToken
//       );

//       const role = response?.user_info?.role?.toLowerCase();

//       if (!role) {
//         return message.error("Invalid login response");
//       }

//       message.success("Login successful");

//       // 2️⃣ Fetch and show unread notifications
//       try {
//         const notifications = await fetchNotification();
//         notifications.forEach((notif) => {
//           GlobalNotification.show(notif.title, notif.description, notif.link, 5); // duration in seconds
//         });

//         // Optional: show a welcome notification
//         GlobalNotification.show("New Notification", "Your campaign has been published!",  "https://google.com", 5);
//       } catch (notifErr) {
//         console.error("Failed to fetch notifications:", notifErr);
//       }

//       // 3️⃣ Request & send FCM token
//       try {
//         const fcmToken = await requestFCMToken();
//         if (fcmToken) {
//           console.log("✅ Got FCM token:", fcmToken);
//           await axios.post(`${BASE_URL}/api/save-fcm-token/`, { token: fcmToken });
//           listenForMessages();
//         }
//       } catch (fcmErr) {
//         console.error("❌ FCM setup failed:", fcmErr);
//       }

//       // 4️⃣ Navigate based on role
//       switch (role) {
//         case "admin":
//         case "coordinator":
//           navigate("/batches");
//           break;
//         case "student":
//           navigate("/student-info");
//           break;
//         case "trainer":
//           navigate("/trainer-info");
//           break;
//         default:
//           message.error("Unknown role!");
//       }
//     } catch (err) {
//       console.error("Login failed:", err);
//       message.error("Login failed. Please check credentials.");
//     }
//   };



//   return (
//     <div className="min-h-screen bg-gradient-to-br from-violet-200 via-sky-200 to-purple-200 flex items-center justify-center px-4">
//       <div className="relative z-10 w-full max-w-lg">
//         <div className="bg-white/70 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/50 p-8">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 shadow-xl">
//               <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
//             </div>
//             <h1 className="text-xl font-semibold text-gray-800 mb-2">
//               Welcome Back
//             </h1>
//             <p className="text-sm text-gray-600">Sign in to your account</p>
//           </div>

//           {/* Form */}
//           <div className="space-y-4">
//             {/* Username */}
//             <div>
//               <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Username
//               </label>
//               <div className="relative group">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <UserOutlined className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   name="username"
//                   value={credentials.username}
//                   onChange={handleChange}
//                   placeholder="Enter your username"
//                   required
//                   className="w-full pl-12 pr-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative group">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <LockOutlined className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type={showpass ? "text" : "password"}
//                   name="password"
//                   value={credentials.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   required
//                   className="w-full pl-12 pr-12 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowpass(!showpass)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center"
//                 >
//                   {showpass ? (
//                     <EyeInvisibleOutlined className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <EyeOutlined className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* reCAPTCHA */}
//             <div style={{ transform: "scale(0.7)", transformOrigin: "0 0" }}>
//               <ReCAPTCHA
//                 sitekey="6LeoRc8rAAAAAINLSEsiJbNVpQwOxfpKUuf1bqF8"
//                 onChange={(token) => setRecaptchaToken(token)}
//               />
//             </div>

//             {/* Login Button */}
//             <button
//               onClick={handleLogin}
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>

//             {/* Forgot Password */}
//             <div className="text-center">
//               <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
//                 Forgot your password?
//               </Link>
//             </div>
//           </div>
//         </div>
//         <div className="text-center mt-6">
//           <p className="text-gray-500 text-sm">Secure • Private • Protected</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;




// // STEP 1 - CLICK RESET PASSWORD AND REQUEST OTP 

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);


//   const navigate = useNavigate();


//   const handleRequestOTP = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);


//     try {
//       const response = await axios.post(`${BASE_URL}/api/request-otp/`, { "email" : email });
//         console.log(response);

//       if (response.status === 200) {
//          const reset_token = response.data.reset_token;
         
//         message.success("OTP sent to your email");
        
//         setTimeout(() => {
//           navigate("/verify-otp", { state: { email, reset_token} }); // Securely pass email in state
//         }, 1000);
//       } else {
//         message.error(response?.data?.message)
//       }
//     } catch (error) {
//       console.log(error);
//       message.error(error.response?.data?.error || "Error sending OTP");
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   return (

//     <>
//       <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-white to-purple-200 flex items-center justify-center px-4">
//         {/* Subtle background elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
//         </div>

//         <div className="relative z-10 w-full max-w-md">
//           {/* Login Card */}
//           <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform hover:scale-105 transition-transform duration-300">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16  rounded-full mb-2 shadow-xl">
//                 {/* <LockOutlined className="w-8 h-8 text-white" /> */}
//                 <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
//               </div>
//               <h1 className="text-xl font-semibold text-gray-800 mb-2">
//                 Forgot your Password?
//               </h1>
//             </div>

//             {/* Form */}
//             <div className="space-y-4">
//               {/* Username Field */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
//                   Enter Registered Email
//                 </label>
//                 <div className="relative group focus:ring-1">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <MailOutlined className="h-5 w-5 text-gray-400  group-focus-within:text-blue-500 transition-colors" />
//                   </div>
//                   <input
//                     type="text"
//                     name="email"
//                     id="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     required
//                     className="w-full pl-12 pr-4 py-2 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
//                   />
//                 </div>
//               </div>

//               {/* Login Button */}
//               <button
//                 onClick={handleRequestOTP}
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center space-x-2">
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                     <span>Sending...</span>
//                   </div>
//                 ) : (
//                   "Send OTP"
//                 )}
//               </button>

//               {/* Forgot Password */}
//               <div className="text-start">
//                 <Link
//                   to="/"
//                   className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
//                 >
//                   <span className="">
//                   <LeftOutlined className="mx-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"/>Back to Login 

//                   </span>
//                 </Link>
//               </div>

//               {/* Divider */}
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-200"></div>
//                 </div>
        
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="text-center mt-6">
//             <p className="text-gray-500 text-sm">
//               Secure • Private • Protected
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export {ForgotPassword};




// // STEP 2 - VERIFY THE OTP SENT TO THE REGISTERED EMAIL 

// const VerifyOTP = () => {
//   const location = useLocation();
//   const reset_token = location.state?.reset_token;
//   const navigate = useNavigate();

//   const [otp, setOtp] = useState(); 
//   const [isVerifying, setIsVerifying] = useState(false);

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     setIsVerifying(true);
    

//     try {
//       const response = await axios.post(`${BASE_URL}/api/verify-otp/`, { "otp" : otp, 'reset_token': reset_token });
//         console.log(response);
        
//       if (response?.data?.verified_token) {
//         const verified_token = response?.data?.verified_token
//         message.success("OTP Verified!");

//         setTimeout(() => {
//           navigate("/reset-password", { state: { verified_token } });
//         }, 2000);
//       } else {
        
//         message.error(response.data?.error || "Invalid OTP");
//       }

//     } catch (error) {
//       console.log(error);
//       message.error(error.response?.data?.error || "Invalid OTP");
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-white to-purple-200 flex items-center justify-center px-4">
//         {/* Subtle background elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
//         </div>

//         <div className="relative z-10 w-full max-w-md">
//           {/* Login Card */}
//           <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform hover:scale-105 transition-transform duration-300">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16  rounded-full mb-2 shadow-xl">
//                 {/* <LockOutlined className="w-8 h-8 text-white" /> */}
//                 <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
//               </div>
//               <h1 className="text-xl font-semibold text-gray-800 mb-2">
//                 Verify OTP
//               </h1>
//             </div>

//             {/* Form */}
//             <div className="space-y-4">
//               {/* Username Field */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
//                   Enter OTP
//                 </label>
//                 <div className="w-full">
//                   <Input.OTP  formatter={(str) => str.replace(/\D/g, '')}  value={otp}  onChange={(value) => setOtp(value)} size="large" />
//                 </div>
//               </div>

//               {/* Login Button */}
//               <button
//                 onClick={handleVerifyOTP}
//                 disabled={isVerifying}
//                 className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200"
//               >
//                 {isVerifying ? (
//                   <div className="flex items-center justify-center space-x-2">
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                     <span>Verifying...</span>
//                   </div>
//                 ) : (
//                   "Verify OTP"
//                 )}
//               </button>

//               {/* Forgot Password */}
//               <div className="text-start">
//                 <Link
//                   to="/forgot-password"
//                   className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
//                 >
//                   <span className="">
//                   <LeftOutlined className="mx-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"/>
//                     Back
//                   </span>
//                 </Link>
//               </div>

//               {/* Divider */}
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-200"></div>
//                 </div>
        
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="text-center mt-6">
//             <p className="text-gray-500 text-sm">
//               Secure • Private • Protected
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export {VerifyOTP};




// // STEP 3 - ENTER NEW PASSWORD 

// const ResetPassword = () => {
//   const location = useLocation();
//   const verified_token = location.state?.verified_token;
//   const navigate = useNavigate();

//   const [newPassword, setNewPassword] = useState("");
//   const [confirmNewPassword, setConfirmNewPassword] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showpass, setShowpass] = useState(null);


//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//    try {
//     if (newPassword !== confirmNewPassword) {
//       message.error("Passwords do not match!");
//       return;
//     }
//    } catch (error) {
//     console.log(error);
//    }
 
//     setIsSubmitting(true);
//     try {
//       const response = await axios.post(`${BASE_URL}/api/reset-password/`, { verified_token, "new_password" : newPassword });

//       if (response.status === 200) {
//         message.success("Password reset successful !");
//         setTimeout(() => {
//           navigate("/");
//         }, 1000);

//       } else {
//         message.error("Failed to reset password, Please try again")
//       }

//     } catch (error) {
//       console.log(error);
//       message.error(error.response?.data?.error || "Error resetting password");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-white to-purple-200 flex items-center justify-center px-4">
//       {/* Subtle background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
//         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-md">
//         {/* Login Card */}
//         <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform hover:scale-105 transition-transform duration-300">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16  rounded-full mb-2 shadow-xl">
//               {/* <LockOutlined className="w-8 h-8 text-white" /> */}
//               <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
//             </div>
//             <h1 className="text-xl font-semibold text-gray-800 mb-2">
//               Reset Password
//             </h1>
//           </div>

//           {/* Form */}
//           <div className="space-y-4">

//             {/* Password Field */}
//             <div>
//               <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
//                 New Password
//               </label>
//               <div className="relative group">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <LockOutlined className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//                 </div>
//                 <input
//                   type={showpass ? "text" : "password"}
//                   name="newPassword"
//                   id="newPassword"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   placeholder="Enter new password"
//                   required
//                   className="w-full pl-12 pr-12 py-2 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowpass(!showpass)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
//                 >
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password Field */}
//             <div>
//               <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Re-enter Password
//               </label>
//               <div className="relative group">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <LockOutlined className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//                 </div>
//                 <input
//                   type={showpass ? "text" : "password"}
//                   name="confirmNewPassword"
//                   id="confirmNewPassword"
//                   value={confirmNewPassword}
//                   onChange={(e) => setConfirmNewPassword(e.target.value)}
//                   placeholder="Confirm New Password"
//                   required
//                   className="w-full pl-12 pr-12 py-2 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowpass(!showpass)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
//                 >
//                   {showpass ? (
//                     <EyeInvisibleOutlined className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                   ) : (
//                     <EyeOutlined className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Login Button */}
//             <button
//               onClick={handleResetPassword}
//               disabled={isSubmitting}
//               className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200"
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   <span>Saving...</span>
//                 </div>
//               ) : (
//                 "Save"
//               )}
//             </button>

//             {/* Forgot Password */}
//             <div className="text-center">
//               <Link
//                 to="/"
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
//               >
//                 <LeftOutlined className="mx-1"/>Back to Login
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-6">
//           <p className="text-gray-500 text-sm">
//             Secure • Private • Protected
//           </p>
//         </div>
//       </div>
//       </div>
//     </>
//   );
// };

// export {ResetPassword};

import React,{ useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";
import { message, Input } from "antd";
import { EyeOutlined, EyeInvisibleOutlined, UserOutlined, LockOutlined, LeftOutlined, MailOutlined } from '@ant-design/icons';
import crawlogo from "../assets/images/crawlogo.png"
import ReCAPTCHA from "react-google-recaptcha";
// import { requestFCMToken } from "../Firebase/fcm.js"; // ✅ FCM service
// import { requestFCMToken, onMessageListener} from "../Firebase/fcm.js"; // ✅ FCM service
import axios from "axios";
import BASE_URL from "../ip/Ip.jsx";
import GlobalNotification from "../Components/dashboard/Notification/NotificationForeGroundPopup.jsx";
import useNotification from "antd/es/notification/useNotification.js";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { loading, universalLogin } = useAuth();
  const navigate = useNavigate();
  const [showpass, setShowpass] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const { fetchNotification, notification } = useNotification();

  
const recaptchaRef = useRef(null);

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
    return message.error("Please complete the reCAPTCHA.");
  }
    try {
      // 1️⃣ Login API call
      const response = await universalLogin(
        credentials.username,
        credentials.password,
        recaptchaToken
      );

      const role = response?.user_info?.role?.toLowerCase();

      if (!role) {
        return message.error("Invalid login response");
      }

      message.success("Login successful");

       if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    }


      // 2️⃣ Fetch and show unread notifications
      try {
        const notifications = await fetchNotification();
        notifications.forEach((notif) => {
          GlobalNotification.show(notif.title, notif.description, notif.link, 5); // duration in seconds
        });

        // Optional: show a welcome notification
        GlobalNotification.show("New Notification", "Your campaign has been published!", 5);
      } catch (notifErr) {
        console.error("Failed to fetch notifications:", notifErr);
      }

      // 3️⃣ Request & send FCM token
      // try {
      //   const fcmToken = await requestFCMToken();
      //   if (fcmToken) {
      //     await axios.post(`${BASE_URL}/api/save-fcm-token/`, { token: fcmToken });
      //     listenForMessages();
      //   }
      // } catch (fcmErr) {
      //   console.error("❌ FCM setup failed:", fcmErr);
      // }

      // 4️⃣ Navigate based on role
      switch (role) {
        case "admin":
        case "coordinator":
          navigate("/batches");
          break;
        case "student":
          navigate("/student-info");
          break;
        case "trainer":
          navigate("/trainer-info");
          break;
        default:
          message.error("Unknown role!");
      }
    } catch (err) {
      console.error("Login failed:", err);
      message.error("Login failed. Please check credentials.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-sky-200 to-purple-200 flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/70 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 shadow-xl">
              <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserOutlined className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-12 pr-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockOutlined className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showpass ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowpass(!showpass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showpass ? (
                    <EyeInvisibleOutlined className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeOutlined className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div style={{ transform: "scale(0.7)", transformOrigin: "0 0" }}>
              <ReCAPTCHA
                sitekey="6LfKEG4rAAAAAEcc-V6fK2sFTSRfW_dokumkhF7i"
                ref={recaptchaRef}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">Secure • Private • Protected</p>
        </div>
      </div>
    </div>
  );
};

export default Login;




// STEP 1 - CLICK RESET PASSWORD AND REQUEST OTP 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const navigate = useNavigate();


  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);


    try {
      const response = await axios.post(`${BASE_URL}/api/request-otp/`, { "email" : email });
        console.log(response);

      if (response.status === 200) {
         const reset_token = response.data.reset_token;
         
        message.success("OTP sent to your email");
        
        setTimeout(() => {
          navigate("/verify-otp", { state: { email, reset_token} }); // Securely pass email in state
        }, 1000);
      } else {
        message.error(response?.data?.message)
      }
    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.error || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };


  return (

    <>
      <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-white to-purple-200 flex items-center justify-center px-4">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform hover:scale-105 transition-transform duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16  rounded-full mb-2 shadow-xl">
                {/* <LockOutlined className="w-8 h-8 text-white" /> */}
                <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800 mb-2">
                Forgot your Password?
              </h1>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Registered Email
                </label>
                <div className="relative group focus:ring-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MailOutlined className="h-5 w-5 text-gray-400  group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-2 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-start">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
                >
                  <span className="">
                  <LeftOutlined className="mx-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"/>Back to Login 

                  </span>
                </Link>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
        
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Secure • Private • Protected
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export {ForgotPassword};




// STEP 2 - VERIFY THE OTP SENT TO THE REGISTERED EMAIL 

const VerifyOTP = () => {
  const location = useLocation();
  const reset_token = location.state?.reset_token;
  const navigate = useNavigate();

  const [otp, setOtp] = useState(); 
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    

    try {
      const response = await axios.post(`${BASE_URL}/api/verify-otp/`, { "otp" : otp, 'reset_token': reset_token });
        console.log(response);
        
      if (response?.data?.verified_token) {
        const verified_token = response?.data?.verified_token
        message.success("OTP Verified!");

        setTimeout(() => {
          navigate("/reset-password", { state: { verified_token } });
        }, 2000);
      } else {
        
        message.error(response.data?.error || "Invalid OTP");
      }

    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-white to-purple-200 flex items-center justify-center px-4">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform hover:scale-105 transition-transform duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16  rounded-full mb-2 shadow-xl">
                {/* <LockOutlined className="w-8 h-8 text-white" /> */}
                <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800 mb-2">
                Verify OTP
              </h1>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="w-full">
                  <Input.OTP  formatter={(str) => str.replace(/\D/g, '')}  value={otp}  onChange={(value) => setOtp(value)} size="large" />
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-start">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
                >
                  <span className="">
                  <LeftOutlined className="mx-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"/>
                    Back
                  </span>
                </Link>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
        
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Secure • Private • Protected
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export {VerifyOTP};




// STEP 3 - ENTER NEW PASSWORD 

const ResetPassword = () => {
  const location = useLocation();
  const verified_token = location.state?.verified_token;
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showpass, setShowpass] = useState(null);


  const handleResetPassword = async (e) => {
    e.preventDefault();
   try {
    if (newPassword !== confirmNewPassword) {
      message.error("Passwords do not match!");
      return;
    }
   } catch (error) {
    console.log(error);
   }
 
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/reset-password/`, { verified_token, "new_password" : newPassword });

      if (response.status === 200) {
        message.success("Password reset successful !");
        setTimeout(() => {
          navigate("/");
        }, 1000);

      } else {
        message.error("Failed to reset password, Please try again")
      }

    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.error || "Error resetting password");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-white to-purple-200 flex items-center justify-center px-4">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform hover:scale-105 transition-transform duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16  rounded-full mb-2 shadow-xl">
              {/* <LockOutlined className="w-8 h-8 text-white" /> */}
              <img src={crawlogo} alt="crawlogo" className="h-12 w-12" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Reset Password
            </h1>
          </div>

          {/* Form */}
          <div className="space-y-4">

            {/* Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockOutlined className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showpass ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full pl-12 pr-12 py-2 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowpass(!showpass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Re-enter Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockOutlined className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showpass ? "text" : "password"}
                  name="confirmNewPassword"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  className="w-full pl-12 pr-12 py-2 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowpass(!showpass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  {showpass ? (
                    <EyeInvisibleOutlined className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeOutlined className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleResetPassword}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save"
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
              >
                <LeftOutlined className="mx-1"/>Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Secure • Private • Protected
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export {ResetPassword};