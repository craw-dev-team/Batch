import Students from "../Components/dashboard/Students/Students";
import { useTheme } from "../Components/Themes/ThemeContext";



const StudentsHome = () => {
    // for theme -------------------------
        const { getTheme } = useTheme();
        const theme = getTheme();
    // -----------------------------------
    return (
        <>
        <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
            <Students/>
        </div>
        </>
    )
}

export default StudentsHome;