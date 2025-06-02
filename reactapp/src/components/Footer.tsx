import { PhoneIcon, EnvelopeIcon} from '@heroicons/react/24/solid';

const Footer = () => {
    return (
        <>
            <div className=" h-[240px] w-full mt-8">
                <div className="grid grid-cols-12 gap-2 h-full ">
                    <div className='col-span-1'>

                    </div>
                    <div className='col-span-10'>
                        <div className='flex justify-between gap-2  h-full '>
                            <div className=''>
                                <div className='flex pb-4'>
                                    <h2 className="text-red-600 font-bold">
                                        GO FILM
                                    </h2>
                                </div>
                                <div className='font-bold'>
                                    
                                    <div className='flex pb-2'>
                                        <a href="#">Giới thiệu</a>
                                    </div>
                                    <div className='flex'>
                                        <a href="#">Bảo mật</a>

                                    </div>
                                </div>
                            </div>
                            <div className=' font-bold'>
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
                            <div className=' font-bold'>
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
                    
                    <div className='col-span-1'>

                    </div>



                </div>

            </div>

            <div className='grid grid-cols-12 gap-2 h-full'>
                <div className="-mx-4 m-h-8 h-6 col-span-12 gap-2 flex items-center justify-center font-bold bg-gray-700">
                    <p className="">BẢN QUYỀN THUỘC </p>
                    <p className="text-red-600"> GO FILM </p>
                </div>
            </div>
        </>
    )
}

export default Footer;