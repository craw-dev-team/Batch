import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";
import { message, Input  } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from "axios";
import BASE_URL from "../ip/Ip";

import ReCAPTCHA from 'react-google-recaptcha';



const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { loading, universalLogin } = useAuth();
  const navigate = useNavigate();
  const [showpass, setShowpass] = useState(null);
  
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });


  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await universalLogin(credentials.username, credentials.password,recaptchaToken );
      if (response?.user_info?.role) {
        const role = response.user_info.role;
  
        message.success("Login successful");
  
        if (role === "coordinator" || role === "admin") {
          navigate("/batches");
        } else if (role === "student") {
          navigate("/student-info");
        } else {
          message.error("Unknown role!");
        }
      } else {
        message.error("Invalid login response");
      }
    } catch (err) {
      // console.error("Login error:", err);
      message.error("Login failed. Please check credentials.");
    }
  };
  

  // const navigateToRegister = () => {
  //   navigate('/register')
  // };


  return (
    <>
    <section className="bg-gray-50 dark:bg-gray-900">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-xl">
                  Login Here
              </h1>
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                  <div>
                      <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                      <input onChange={handleChange} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter username" required=""></input>
                  </div>
               
                  <div className="relative">
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input onChange={handleChange} type={showpass ? 'text' : 'password'} name="password" id="password" placeholder="Enter Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""></input>
                      <span onClick={() => setShowpass(!showpass)} 
                      className="absolute right-2 mt-1 top-1/2   text-black cursor-pointer"
                      >{ showpass 
                        ? <EyeOutlined />
                        : <EyeInvisibleOutlined />
                      }
                        </span>
                  </div>

                  <div style={{ transform: "scale(0.8)", transformOrigin: "0 0" }}>
                    <ReCAPTCHA
                      sitekey="6LdHF24rAAAAADYWk6V5GokFKLJvcv-vh_bhNqjw"  // 🔁 Replace with your real site key
                      onChange={(token) => setRecaptchaToken(token)}
                    />
                  </div>

                  <div>
                      <button disabled={loading} type="submit" className="w-full bg-green-400 p-3 rounded-md hover:bg-green-500 transition-all ease-in">Login</button>
                  </div>

                      <div>
                      <Link to="/forgot-password" className="text-blue-700 text-sm hover:underline">Reset Password</Link>
                      </div>

                  <p className="text-sm font-light flex text-gray-500">
                      Didn't have an account? <span className="pl-2 font-light text-primary-600">Contact your coordinator</span>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
    </>
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
      await axios.post(`${BASE_URL}/api/request-otp/`, { "email" : email });
      message.success("OTP sent to your email");

      setTimeout(() => {
        navigate("/verify-otp", { state: { email } }); // Securely pass email in state
      }, 1000);
    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.error || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-xl">
                        Forgot Password
                    </h1>
                    <form onSubmit={handleRequestOTP} className="space-y-4 md:space-y-6">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Registered Email</label>
                            <input value={email}  onChange={(e) => setEmail(e.target.value)} type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.in" required=""></input>
                        </div>

                        <div>
                            <button type="submit"  disabled={isLoading} className={`w-full p-3 rounded-md transition-all ease-in ${isLoading ?  "bg-gray-300 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"}`}> {isLoading ? "Sending..." : "Send OTP"}</button>
                        </div>
                      
                    </form>
                </div>
            </div>
        </div>
      </section>
    </>
  );
};

export {ForgotPassword};




// STEP 2 - VERIFY THE OTP SENT TO THE REGISTERED EMAIL 

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(); 
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      await axios.post(`${BASE_URL}/api/verify-otp/`, { "email" : email, "otp" : otp });
      message.success("OTP Verified !");

      setTimeout(() => {
        navigate("/reset-password", { state: { email } }); 

      }, 1000);

    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
       <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-xl">
                        Verify OTP
                    </h1>
                    <form onSubmit={handleVerifyOTP}  className="space-y-4 md:space-y-6">
                        <div className="text-center">
                            {/* <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter Registered Email</label> */}
                            {/* <input type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.in" required=""></input> */}
                            <Input.OTP formatter={(str) => str.replace(/\D/g, '')}  value={otp}  onChange={(value) => setOtp(value)} size="small" />

                        </div>

                        <div>
                            <button type="submit"  disabled={isVerifying} className={`w-full p-3 rounded-md transition-all ease-in ${isVerifying ? "bg-gray-400 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"} `}> {isVerifying ? "Verifying..." : "Verify OTP"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </section>
    </>
  );
};

export {VerifyOTP};




// STEP 3 - ENTER NEW PASSWORD 

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

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
      await axios.post(`${BASE_URL}/api/reset-password/`, { "email" : email, "new_password" : newPassword });
      message.success("Password reset successful !");
    
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.error || "Error resetting password");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Enter New Password
                    </h1>
                    <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-6">
                        <div className="relative">
                            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                            <input  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="text" name="newPassword" id="newPassword" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter New Password" required=""></input>
                        </div>
                        
                        <div className="relative">
                            <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm New Password</label>
                            <input value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} type={showpass ? "text" : "password"} name="confirmNewPassword" id="confirmNewPassword" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Confirm New Password" required=""></input>
                            <span onClick={() => setShowpass(!showpass)} 
                            className="absolute right-2 mt-1 top-1/2   text-black cursor-pointer"
                            >{ showpass 
                              ? <EyeOutlined />
                              : <EyeInvisibleOutlined />
                            }
                            </span>
                        </div>

                        <div>
                            <button type="submit" disabled={isSubmitting} className={`w-full p-3 rounded-md transition-all ease-in ${isSubmitting ?  "bg-gray-400 cursor-not-allowed" : "bg-green-400  hover:bg-green-500"}`}>{isSubmitting ? "Saving..." : "Save"}</button>
                        </div>
                      
                    </form>
                </div>
            </div>
        </div>
      </section>
    </>
  );
};

export {ResetPassword};