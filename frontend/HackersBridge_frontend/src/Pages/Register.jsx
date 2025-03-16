import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/dashboard/AuthContext/AuthContext";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Select } from "antd";




const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "admin" });
  const { register } = useAuth();
  const [showpass, setShowpass] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    register(formData);
    setTimeout(() => {
      navigate('/login')
    }, 3000);
  }

  const navigateToLogin = () => {
    navigate('/login')
  };


  return (
    <>
    <section className="bg-gray-50 dark:bg-gray-900">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white">
                  Create an account
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                  <div>
                      <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                      <input value={formData.username} onChange={(e) => handleChange(e.target.name, e.target.value)} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Enter username" required=""></input>
                  </div>

                  <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input value={formData.email}  onChange={(e) => handleChange(e.target.name, e.target.value)} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="name@company.in" required=""></input>
                  </div>

                  <div className="relative">
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                  <input value={formData.password}  onChange={(e) => handleChange(e.target.name, e.target.value)} type={showpass ? 'text' : 'password'} name="password" id="password" placeholder="Enter Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""></input>
                      <span onClick={() => setShowpass(!showpass)} 
                      className="absolute right-2 mt-1 top-1/2   text-black cursor-pointer"
                      >{ showpass 
                        ? <EyeOutlined />
                        : <EyeInvisibleOutlined />
                      }
                        </span>
                  </div>

                    <div>
                      <Select name="role" value={formData.role} onChange={(value) => handleChange("role", value)}  className="w-full rounded-lg border border-gray-400" placeholder="Select Role" size="large"
                        options={[
                          { value: 'admin', label: 'Admin' },
                          { value: 'coordinator', label: 'Coordinator' },
                          { value: 'trainer', label: 'Trainer' },
                      ]} 
                      />
                      {/* <select name="role" onChange={handleChange} className="w-full rounded-lg border border-gray-300">
                          <option value="admin">Admin</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="trainer">Trainer</option>
                        </select> */}
                    </div>

                  <div>
                      <button className="w-full bg-green-400 p-3 rounded-md hover:bg-green-500 transition-all ease-in" onClick={handleRegister}>Register</button>
                  </div>

                  {/* <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Create an account</button> */}
                  <p class="text-sm font-light flex text-gray-500 dark:text-gray-400">
                      Already have an account? <p onClick={() => navigateToLogin()} class="pl-2 cursor-pointer font-medium text-primary-600 hover:underline">Login here</p>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
    </>

    
  );
};

export default Register;
