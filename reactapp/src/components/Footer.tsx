import { PhoneIcon, EnvelopeIcon} from '@heroicons/react/24/solid';

const Footer = () => {
    return (
        <>
            <div className="bg-[#333333] h-[240px] w-full">
                <div className="grid grid-cols-12 gap-2 h-full ">
                    <div className='col-span-2'>

                    </div>
                    <div className='col-span-8'>
                        <div className='grid grid-cols-3 gap-2  h-full '>
                            <div className='pl-4'>
                                <div className='flex pb-4'>
                                    <h2 className="text-red-600">
                                        GO FILM
                                    </h2>
                                </div>
                                <div className='text-white'>
                                    
                                    <div className='flex pb-2'>
                                        <a href="#">Giới thiệu</a>
                                    </div>
                                    <div className='flex'>
                                        <a href="#">Bảo mật</a>

                                    </div>
                                </div>
                            </div>
                            <div className='pl-4 text-white'>
                                <div  className='mb-4'>
                                    <h2 className='flex items-center'>
                                        HỔ TRỢ
                                    </h2>
                                </div>
                                <div className="flex items-center ">
                                    
                                    <div className='' >
                                        <a href="#" className='p-4 inline-block'>
                                            <img src="/img/logofb.png" alt="" className="w-5 h-5 object-contain"/>
                                        </a>
                                    </div>
                                    <div className=''>
                                        <a href="#" className='p-4 inline-block'>
                                            <img src="/img/logozl.png" alt="" className="w-5 h-5"/>

                                        </a>
                                    </div>
                                    <div >
                                        <a href="#" className='p-4 inline-block'>
                                            <img src="/img/logoins.png" alt="" className="w-5 h-5"/>
                                        </a>
                                    </div>
        

                                </div>
                            </div>
                            <div className='pl-4 text-white'>
                                <div className='mb-4'>
                                    <h2 className='flex items-center'>
                                        LIÊN HỆ
                                    </h2>
                                </div>
                                <div className=''>
                                    <div className='flex items-center '>
                                        <PhoneIcon className='w-5 h-5 mr-3'/>
                                        <p>0353946625</p>
                                    </div>
                                    <div className='flex items-center'>
                                        <EnvelopeIcon className='w-5 h-5 mr-3'/>
                                        <p>kiendzsh1@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className='col-span-2'>

                    </div>
                </div>
                <div className="flex items-center justify-center bg-black">
                    <p className="text-white">BẢN QUYỀN THUỘC </p>
                    <p className="text-red-600">GO FILM </p>
                </div>
            </div>
        </>
    )
}

export default Footer;