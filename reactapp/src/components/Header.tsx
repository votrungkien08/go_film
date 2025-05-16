import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon  } from '@heroicons/react/24/solid';

const Header = () => {
  return (
    <div className="bg-[#333333] h-[60px] w-full ">
        <div className='grid grid-cols-12 gap-2 h-full items-center   '>
            <div className='col-span-2  flex items-center cursor-pointer h-full'>
                <img src="/img/gofilm.png" alt="logo" className='mt-[10px] h-[50px] object-contain ' />
            </div>
            <div className='col-span-6 flex items-center justify-start h-full'>
                <div tabIndex={0} className='group   flex items-center justify-center cursor-pointer'>
                    <h2 className='p-4 text-white group-hover:text-[#ff4c00]'>THỂ LOẠI</h2>
                </div>
                <div tabIndex={0} className='group h-full  flex items-center justify-center cursor-pointer'>
                    <h2 className='p-4 text-white group-hover:text-[#ff4c00]'>QUỐC GIA</h2>
                </div>
                <div tabIndex={0} className='group h-full  flex items-center justify-center cursor-pointer'>
                    <h2 className=' p-4 text-white group-hover:text-[#ff4c00]'>NĂM</h2>
                </div>
                <div tabIndex={0} className='group h-full  flex items-center justify-center cursor-pointer'>
                    <h2 className='p-4 text-white group-hover:text-[#ff4c00]'>PHIM LẺ</h2>
                </div>
                <div tabIndex={0} className='group h-full  flex items-center justify-center cursor-pointer'>
                    <h2 className='p-4 text-white group-hover:text-[#ff4c00] '>PHIM BỘ</h2>
                </div>
            </div>
            <div tabIndex={0} className='group col-span-3 h-full flex items-center relative cursor-pointer'>
                <input type="search" placeholder='Tìm Kiếm' className='text-white h-[30px] w-full  pl-2  border rounded-2xl outline-none group-hover:border-[#ff4c00]' />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute ml-68" />
            </div>
            <div className='col-span-1 flex items-center justify-end  cursor-pointer'>
               <UserCircleIcon className="h-10 w-10 text-white border rounded-3xl border-white " />
            </div>
        </div>



    </div>
  );
};











export default Header