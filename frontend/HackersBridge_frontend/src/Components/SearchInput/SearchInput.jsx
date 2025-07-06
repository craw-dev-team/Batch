import { useState, useEffect } from "react";
import useDebouncedValue from "./useDebouncedValue";

const SearchBar = ({
  onSearch,
  onClear,
  placeholder = "Search...",
  debounce = 500,
  inputClassName = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebouncedValue(inputValue, debounce);

  // Trigger search when debounced input changes
  useEffect(() => {
    onSearch?.(debouncedValue.trimStart());
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setInputValue("");
    onSearch?.("");
    onClear?.();
  };

  return (
    <div className="relative">
        <input value={inputValue} type="text" id="table-search" placeholder={placeholder}
            onChange={(e) => setInputValue(e.target.value)}
            className={inputClassName} 
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <button  onClick={handleClear}>
        {inputValue  ? (
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
            ) : (
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                </svg>
            )}
        </button>
        </div>
    </div>
  );
};

export default SearchBar;
