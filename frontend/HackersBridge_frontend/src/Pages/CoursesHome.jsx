import Course from "../Components/dashboard/Courses/Courses";
import { useTheme } from "../Components/Themes/ThemeContext";




const CoursesHome = () => {
    // for theme -------------------------
        const { getTheme } = useTheme();
        const theme = getTheme();
    // -----------------------------------
    
    return (
        <>
        <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
         <Course />
        </div>
        </>
    )
}

export default CoursesHome;