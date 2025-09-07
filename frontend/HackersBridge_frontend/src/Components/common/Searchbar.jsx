
// import search from "../../assets/svgIcon/search.svg";
import NotificationIcon from "../../svg/NotificationIcon";
import { useTheme } from "../Themes/ThemeContext";
import BreadCrumbs from "./Breadcrumbs";



const SearchBar = () => {
   // for theme -------------------------
     const { getTheme } = useTheme();
     const theme = getTheme();
   // ------------------------------------
    return (
        <>
        <div className={`w-full h-14 overflow-hidden grid grid-cols-2 justify-end px-10 pl-4 border-b border-gray-300 ${theme.bg}`}>
            <div className="relative flex items-center">
                <BreadCrumbs />
            </div>
         {/* <div className={'w-2/8 h-10 flex justify-end items-center px-[10px] py-3 rounded-lg border-[1.3px] border-lightGrayColor2 dark:darkGrayColor2'}> */}
                        {/* <input type="text" placeholder="Search..." className={'cursor-text w-full focus:outline-green-400 bg-transparent dark:text-white pr-4'}/> */}
                        {/* <input type="text"  placeholder="Search..."  className={'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'}/> */}
                        {/* <img src={search} alt=""/> */}
                        <div className="flex justify-end items-center ">
                            {/* <div className="relative w-56">
                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5">
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>

                                </div>
                                <input type="text" placeholder="Search...." className="block w-full h-8 ps-2 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                </input>
                            </div> */}

                    <div className="ml-10 flex items-center">
                    <NotificationIcon fill={"fill-lightBlue2 dark:fill-white"}/>
                    </div>
                    </div>
                 {/* </div> */}
                 
        </div>
        </>
    )
}

export default SearchBar;