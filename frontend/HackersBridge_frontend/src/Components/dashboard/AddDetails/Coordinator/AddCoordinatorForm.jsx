import { useState, useEffect } from "react";
import { Select, Input, message  } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import axios from "axios";
import BASE_URL from "../../../../ip/Ip";
import { useCoordinatorForm } from "./CoordinatorContext";




const AddCoordinatorForm = ( { isOpen, onClose, coordinatorData } ) => {
    if (!isOpen) return null;

    const isEditing = Boolean(coordinatorData?.id); 

    const { coordinatorFormData, setCoordinatorFormData, errors, setErrors, resetCoordinatorForm } = useCoordinatorForm();
    const [ loading, setLoading] = useState(false);


    useEffect(() => {
        if (coordinatorData) {
            setCoordinatorFormData({
                coordinatorId: coordinatorData.coordinator_id || "",
                coordinatorName: coordinatorData.name || "",
                coordinatorEmail: coordinatorData.email || "",
                coordinatorNumber: coordinatorData.phone || "",
                coordinatorWeekOff: coordinatorData.weekoff || "",
            });
        } else {
            resetCoordinatorForm();
        }
    }, []);


    const handleChange = (name, value) => {
        setCoordinatorFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };


    const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            // if (!validateForm()) return; // Stop submission if validation fails

            const payload = {
                coordinator_id: coordinatorFormData.coordinatorId,
                name: coordinatorFormData.coordinatorName,
                email: coordinatorFormData.coordinatorEmail,
                phone: coordinatorFormData.coordinatorNumber,
                weekoff: coordinatorFormData.coordinatorWeekOff,
            };
            console.log("Final Payload:", JSON.stringify(payload, null, 2));

            try {
                setLoading(true); // Start loading

                let response;
                let successMessage = "";
                if (coordinatorData && coordinatorData.id) {
                // Update existing course (PUT)
                response = await axios.put(`${BASE_URL}/api/coordinators/edit/${coordinatorData.id}/`, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
                successMessage = "Coordinator updated successfully!";
                } else {
                    // Add new course (POST)
                    response = await axios.post(`${BASE_URL}/api/coordinators/add/`, payload, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    successMessage = "Coordinator added successfully!";
                }

                if (response.status >= 200 && response.status < 300) {
                    message.success(successMessage);
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                        resetCoordinatorForm();
                    }, 1000);
                }
            } catch (error) {
                message.error("Failed to submit the form.");
                setLoading(false);
            }
            
        };
    

     // FOR RESETTING ERRORS 
     const resetErrors = () => {
        setErrors({}); // Clear all errors
    };

    const handleClose = () => {
        resetErrors(); // Clear errors when modal closes
        onClose(); // Close the modal
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
             <div className="relative p-2 w-4/6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
                 
                 {/* Modal Header */}
                 <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                     {isEditing ? "Edit Coordinator Details" : "Add New Coordinator"}
                     </h3>
                     <button
                        onClick={() => { handleClose(); }}
                         type="button"
                         className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                     >
                         <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                             <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                         </svg>
                         <span className="sr-only">Close modal</span>
                     </button>
                 </div>
 
                 {/* Modal Form */}
                <form className="p-4 md:p-5" onSubmit={handleFormSubmit}>
                    <div className="grid gap-4 mb-4 grid-cols-3">
                        <div className="col-span-1">
                            <label htmlFor="coordinatorId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Coordinator Id</label>
                            <Input name="coordinatorId" value={coordinatorFormData.coordinatorId} onChange={(e) => handleChange("coordinatorId", e.target.value)} className='rounded-lg border-gray-300' placeholder="Coordinator Id"/>
                            {/* {errors.coordinatorId && <p className="text-red-500 text-sm">{errors.coordinatorId}</p>} */}
                        </div>

                        {/* Coordinator Name  */}
                        <div className="col-span-1">
                            <label htmlFor="coordinatorName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Coordinator Name</label>
                            <Input name="coordinatorName" value={coordinatorFormData.coordinatorName} onChange={(e) => handleChange("coordinatorName", e.target.value)} className='rounded-lg border-gray-300' placeholder="Coordinator Name"/>
                            {/* {errors.coordinatorName && <p className="text-red-500 text-sm">{errors.coordinatorName}</p>} */}
                        </div>
 
                        {/* Coordinator Email */}
                        <div className="col-span-1">
                            <label htmlFor="coordinatorEmail" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Coordinator Email</label>
                            <Input name="coordinatorEmail" value={coordinatorFormData.coordinatorEmail} className='rounded-lg border-gray-300' placeholder="Coordinator Email"
                                onChange={(e) => {
                                    const inputValue = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""); // Allow email characters
                                    handleChange("coordinatorEmail", inputValue);
                                }}
                            />
                            {/* {errors.CoordinatorEmail && <p className="text-red-500 text-sm">{errors.CoordinatorEmail}</p>} */}
                        </div>


                         {/* Coordinator Phone Number */}
                         <div className="col-span-1">
                         <label htmlFor="coordinatorNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                           <Input name="coordinatorNumber" value={coordinatorFormData.coordinatorNumber}  className='rounded-lg border-gray-300'  placeholder='Enter Phone Number' 
                                onChange={(e) => {
                                    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric values
                                    if (inputValue.length <= 10) {
                                        handleChange("coordinatorNumber", inputValue);
                                    }
                                }} 
                           />
                            {/* {errors.coordinatorNumber && <p className="text-red-500 text-sm">{errors.coordinatorNumber}</p>} */}
                        </div>

                         {/* Dropdown for Language Selection */}
                         <div className="col-span-1 sm:col-span-1">
                         <label htmlFor="coordinatorWeekOff" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Coordinator's Week Off</label>
                           <Select name="coordinatorWeekOff" value={coordinatorFormData.coordinatorWeekOff.length > 0 ? coordinatorFormData.coordinatorWeekOff : null } onChange={(value) => handleChange("coordinatorWeekOff", value)} className='w-full border-gray-300' size='large' placeholder='Select Week Off' 
                                options={[
                                            { value: 'Monday', label: 'Monday' },
                                            { value: 'Tuesday', label: 'Tuesday' },
                                            { value: 'Wednesday', label: 'Wednesday' },
                                            { value: 'Thursday', label: 'Thursday' },
                                            { value: 'Friday', label: 'Friday' },
                                            { value: 'Saturday', label: 'Saturday' },
                                            { value: 'Sunday', label: 'Sunday' },
                                        ]}
                            />
                            {/* {errors.coordinatorWeekOff && <p className="text-red-500 text-sm">{errors.coordinatorWeekOff}</p>} */}
                        </div>
                    </div>

                   <div className="flex justify-end">
                   <button
                    type="submit"
                    disabled={loading} // Disable button when loading
                    className={`text-white inline-flex items-center font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none
                        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 focus:ring-green-300"}
                        `}
                >
                    {loading ? (
                        <>
                            <SyncOutlined spin className="mr-2" />
                            Processing...
                        </>
                    ) : isEditing ? "Save Changes" : "Add Coordinator"}
                </button>
                   </div>
                </form>
             </div>
         </div>
        </>
    )
};

export default AddCoordinatorForm;