import Counsellor from "../../Components/dashboard/AddDetails/Counsellor/Counsellor";
import { useTheme } from "../../Components/Themes/ThemeContext";





const CounsellorsHome = () => {
    // for theme -------------------------
        const { getTheme } = useTheme();
        const theme = getTheme();
    // -----------------------------------

    return (
        <>
    <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
            <Counsellor />
            {/* <Table1 /> */}
        </div>
        </>
    )
}

export default CounsellorsHome;