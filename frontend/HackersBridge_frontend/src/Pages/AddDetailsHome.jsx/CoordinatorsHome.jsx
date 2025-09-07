import Coordinators from "../../Components/dashboard/AddDetails/Coordinator/Coordinator";
import { useTheme } from "../../Components/Themes/ThemeContext";





const CoordinatorsHome = () => {
    // for theme -------------------------
        const { getTheme } = useTheme();
        const theme = getTheme();
    // -----------------------------------

    return (
        <>
    <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
            <Coordinators />
            {/* <Table1 /> */}
        </div>
        </>
    )
}

export default CoordinatorsHome;