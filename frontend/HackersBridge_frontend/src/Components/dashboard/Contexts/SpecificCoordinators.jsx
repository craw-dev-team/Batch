import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/api";




const SpecificCoordinatorContext = createContext();

const SpecificCoordinatorProvider = ({ children }) => {
    const [specificCoordinator, setSpecificCoordinator] = useState();
    const [loading, setLoading] = useState(false);
    const [specificCoordinatorStudents, setSpecificCoordinatorStudents] = useState()
    const [specificCoordinatorTrainers, setSpecificCoordinatorTrainers] = useState()
    const [activityLogs, setActivityLogs] = useState()

    const fetchSpecificCoordinator = async (coordinatorId) => {
        if (loading) return;


        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/coordinators/info/${coordinatorId}/`)
            const data = response?.data
            
            setSpecificCoordinator(data);

        } catch (error) {
            console.error('Error fetching SpecificCoordinator Data', error)
        } finally {
            setLoading(false)
        };
    };


    // FETCH SPECIFIC COORDINATOR STUDENTS 
    const fetchSpecificCoordinatorStudents = async (coordinatorId) => {
        if (loading) return;

        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/coordinators/${coordinatorId}/students/` )
            const data = response?.data            

            setSpecificCoordinatorStudents(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            })

        } catch (error) {
            console.error('Error fetching SpecificCoordinatorStudents Data', error)
        } finally {
            setLoading(false)
        }
    };


    // FETCH SPECIFIC COORDINATOR TRAINERS   
    const fetchSpecificCoordinatorTrainers = async (coordinatorId) => {
        if (loading) return;

        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/coordinators/${coordinatorId}/trainer/`, )
            const data = response?.data            

            setSpecificCoordinatorTrainers(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                    return data;
                }
                return prevData;
            })

        } catch (error) {
            console.error('Error fetching SpecificCoordinatorTrainers Data', error)
        } finally {
            setLoading(false)
        }
    };


    // FETCH COORDINATOR ACTIVITY LOGS 
    const fetchSpecificCoordinatorActivityLogs = async (coordinatorId, { page = 1, pageSize = 50, search = '', type } = {}) => {
        if (loading) return;

        setLoading(true)

        try {
            const response = await axiosInstance.get(`/api/coordinators/info/${coordinatorId}/`, 
                { 
                params: {
                    page,
                    page_size: pageSize,
                    search,
                    type
                }
            }
            )
            const data = response?.data
            
            setActivityLogs(data);

        } catch (error) {
            console.error('Error fetching SpecificCoordinator Data', error)
        } finally {
            setLoading(false)
        };
    };


    return (
        <SpecificCoordinatorContext.Provider value={{ loading, specificCoordinator, fetchSpecificCoordinator, specificCoordinatorStudents, fetchSpecificCoordinatorStudents,specificCoordinatorTrainers, fetchSpecificCoordinatorTrainers, activityLogs, fetchSpecificCoordinatorActivityLogs }}>
            {children}
        </SpecificCoordinatorContext.Provider>
    )

};

const useSpecificCoordinator = () => {
    const context = useContext(SpecificCoordinatorContext);
    if (!context) {
        throw new Error('Specific Coordinator must be used within Specific Coordinator Provider')
    }
    return context
}

export { SpecificCoordinatorProvider, useSpecificCoordinator }