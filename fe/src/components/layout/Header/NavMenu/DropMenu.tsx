
import { useState, useRef,useEffect } from "react";
type DropdownMenuProps<T> = {
    title: string
    dataItems: T[];
    getLabel: (item:T) => string;
    onSelect: (item: T) => void;
}

const DropdownMenu = <T,>({ title, dataItems, getLabel, onSelect }: DropdownMenuProps<T>) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const refTab = useRef(null);
    const [hoverPosition, setHoverPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    const handleHover = (e: React.MouseEvent<HTMLHeadingElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const containerRect = refTab.current?.getBoundingClientRect();
        if (containerRect) {
            setHoverPosition({
                left: rect.left - containerRect.left,
                width: rect.width,
                opacity: 1,
            });
        }
    };

    const handleMouseLeave = () => {
        
        setHoverPosition((prev) => ({
            ...prev,
            opacity: 0,
        }));
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ( dropdownRef.current && !dropdownRef.current.contains(event.target as Node) ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (
        <>
                <div
                    tabIndex={0}
                    className="group relative flex items-center justify-center cursor-pointer"
                    ref={dropdownRef}
                    
                >
                <h2
                style={{ pointerEvents: 'auto' }}
                    
                        className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                        onClick={() =>  setShowDropdown(!showDropdown)  }
                        onMouseEnter={handleHover}
                        onMouseLeave={handleMouseLeave}

                    >
                        {title}
                    </h2>
                    {showDropdown && (
                        <div className="absolute top-full left-0 bg-gray-800 rounded-lg shadow-lg w-64 z-[100] p-2 max-h-96 overflow-y-auto grid grid-cols-2">
                    
                        {dataItems.map((item,index) => (
                            <button
                                key={index}
                                className="w-full text-left px-2 py-1 text-white hover:bg-[#ff4c00] rounded-lg text-sm"
                                onClick={() =>
                                    onSelect(item)
                                }
                            >
                                {getLabel(item)}
                            </button>
                        ))}
                        </div>
                    )}
                </div>
            
        </>

    )
}
    
export default DropdownMenu;