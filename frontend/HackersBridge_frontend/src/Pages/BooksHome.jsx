import Books from "../Components/dashboard/Books/Books";
import { useTheme } from "../Components/Themes/ThemeContext";



const BooksHome = () => {
    // for theme -------------------------
        const { getTheme } = useTheme();
        const theme = getTheme();
    // -----------------------------------

    return (
        <>
        <div className={`w-full h-full overflow-hidden ${theme.bg}`}>
            <Books />
        </div>
        </>
    )
}

export default BooksHome;