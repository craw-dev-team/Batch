import Batches from "../Components/dashboard/Batches/Batches";
import { useTheme } from "../Components/Themes/ThemeContext";



const BatchesHome = () => {
    // for theme -------------------------
        const { getTheme } = useTheme();
        const theme = getTheme();
    // -----------------------------------
    return (
        <>
        <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
            <Batches />
            {/* <Table1 /> */}
        </div>
        </>
    )
}

export default BatchesHome;