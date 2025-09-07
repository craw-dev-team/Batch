import Trainers from "../Components/dashboard/Trainers/Trainers";
import { useTheme } from "../Components/Themes/ThemeContext";





const TrainersHome = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
// -----------------------------------
    return (
        <>
        <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
            <Trainers/>
        </div>
        </>
    )
}

export default TrainersHome;