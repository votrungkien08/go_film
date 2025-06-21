import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const Footer = () => {
    return (
        <>
            <div className="h-[240px] w-full mt-8">
                <div className="grid grid-cols-12 gap-2 h-full">
                    <div className="col-span-2"></div>

                    <div className="col-span-8">
                        <div className="grid grid-cols-3 gap-2 h-full">
                            {/* GO FILM */}
                            <div>
                                <div className="flex pb-4">
                                    <h2 className="text-red-600">GO FILM</h2>
                                </div>
                                <div className="text-white">
                                    <div className="flex pb-2">
                                        <a href="#">Giới thiệu</a>
                                    </div>
                                    <div className="flex">
                                        <a href="#">Bảo mật</a>
                                    </div>
                                </div>
                            </div>

                            {/* HỖ TRỢ */}
                            <div className="text-white">
                                <div className="mb-4">
                                    <h2 className="flex items-center">HỖ TRỢ</h2>
                                </div>
                                <div className="flex items-center">
                                    <div>
                                        <a href="#" className="p-4 inline-block">
                                            <img
                                                src="/img/logofb.png"
                                                alt="Facebook"
                                                className="w-5 h-5 object-contain"
                                            />
                                        </a>
                                    </div>
                                    <div>
                                        <a href="#" className="p-4 inline-block">
                                            <img
                                                src="/img/logozl.png"
                                                alt="Zalo"
                                                className="w-5 h-5"
                                            />
                                        </a>
                                    </div>
                                    <div>
                                        <a href="#" className="p-4 inline-block">
                                            <img
                                                src="/img/logoins.png"
                                                alt="Instagram"
                                                className="w-5 h-5"
                                            />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* LIÊN HỆ */}
                            <div className="text-white">
                                <div className="mb-4">
                                    <h2 className="flex items-center">LIÊN HỆ</h2>
                                </div>
                                <div>
                                    <div className="flex items-center mb-2">
                                        <PhoneIcon className="w-5 h-5 mr-3" />
                                        <a href="tel:0908302511" className="hover:underline">
                                            0908302511
                                        </a>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <PhoneIcon className="w-5 h-5 mr-3" />
                                        <a href="tel:0769884124" className="hover:underline">
                                            0769884124
                                        </a>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <EnvelopeIcon className="w-5 h-5 mr-3" />
                                        <a href="mailto:kiendzsh1@gmail.com" className="hover:underline">
                                            kiendzsh1@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center">
                                        <EnvelopeIcon className="w-5 h-5 mr-3" />
                                        <a href="mailto:baoanhh.dev@mail.com" className="hover:underline">
                                            baoanhh.dev@mail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2"></div>
                </div>

                <div className="flex items-center justify-center bg-black py-2">
                    <p className="text-white mr-1">BẢN QUYỀN THUỘC</p>
                    <p className="text-red-600">GO FILM</p>
                </div>
            </div>
        </>
    );
};

export default Footer;
