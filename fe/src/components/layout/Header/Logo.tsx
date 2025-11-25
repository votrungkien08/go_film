import { Link } from "react-router-dom";

export default function Logo (){
    return (
            <div className="col-span-2 flex items-center cursor-pointer h-full">
        <Link to="/" className="flex items-center h-full">
            <img
                src="/img/gofilm.png"
                alt="logo"
                className="mt-[10px] h-[50px] object-contain"
            />
        </Link>
    </div>
    );
}