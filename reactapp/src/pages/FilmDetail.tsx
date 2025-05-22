// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { UserCircleIcon } from '@heroicons/react/24/solid';
// //import { renderLoginForm } from './components/AdminPage';
// import renderLoginForm from '../components/AdminPage';
// import Login from '../components/Login'; // Đường dẫn tới form đăng nhập của bạn
// const FilmDetail = () => {
//     // hook useParams() sẽ lấy id từ URL
//     const { id } = useParams();
//     // useState() để lưu trữ dữ liệu phim
//     const [data, setData] = useState<any>(null);

//     // tab để chuyển đổi giữa các tab
//     const [tab, setTab] = useState<'info' | 'listEpisodes' | 'comment'>('info');

//     const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);

//     const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

//     const [showCommentForm, setShowCommentForm] = useState(false);

//     const [showLoginForm, setShowLoginForm] = useState(false);

//     useEffect(() => {
//         const token = localStorage.getItem('token');

//         fetch(`http://localhost:8000/api/user`, {
//             method: 'GET',
//             headers: { Authorization: `Bearer ${token}` }
//         })
//             .then(response => response.json())
//             .then(data => {
//                 console.log('User data:', data);
//                 setIsLoggedIn(!!data.user);
//             })
//             .catch(err => {
//                 console.error('Fetch error:', err);
//             });
//     }, []);

//     // useEffect() khi đc render sẽ thay đổi
//     useEffect(() => {
//         fetch(`http://localhost:8000/api/film/${id}`)
//             .then(response => response.json())
//             .then(data => setData(data))
//     }, [id]);
//     if (!data) return <div>Đang tải...</div>;
//     if (!data.success) return <div>Không tìm thấy phim</div>;
//     console.log(data);
//     const film = data.Film;
//     const episodes = data.Film_episodes;

//     return (
//         <div className="grid grid-cols-12 gap-2 h-full items-center">
//             <div className="col-span-2"></div>
//             <div className="col-span-8">
//                 <div className="grid grid-cols-8 gap-2 h-full">
//                     <div className="grid col-span-5 ">
//                         <div >
//                             {episodes && episodes.length > 0 ?
//                                 (
//                                     <video src={episodes[selectedEpisodeIndex].episode_url}></video>
//                                 ) :
//                                 (
//                                     <div>
//                                         Chưa có tập phim nào
//                                     </div>
//                                 )

//                             }
//                         </div>

//                         <div>

//                         </div>

//                         <div className="text-[#bbbbbb] text-left my-2">
//                             <h1>{film.title_film} Tập {episodes[selectedEpisodeIndex]?.episode_title}</h1>
//                         </div>
//                         <div className="text-[#bbbbbb] text-left my-2">
//                             <span>Lượt xem: {film.view}</span>
//                         </div>
//                         <div className="text-white text-left border-b border-gray-50 py-2 gap-2">
//                             <button className={`mr-2 p-2 rounded-4xl ${tab === 'info' ? 'bg-[#ff3c00]  ' : 'bg-[#000000]'} `} onClick={() => setTab('info')}>Thông tin</button>
//                             <button className={`mr-2 p-2 rounded-4xl ${tab === 'listEpisodes' ? 'bg-[#ff3c00]  ' : 'bg-[#000000]'}`} onClick={() => setTab('listEpisodes')}>Danh sách tập</button>
//                             <button className={`p-2 rounded-4xl ${tab === 'comment' ? 'bg-[#ff3c00]  ' : 'bg-[#000000]'}`} onClick={() => setTab('comment')}>Comment</button>
//                         </div>

//                         <div className="text-left mt-2">
//                             {tab == 'info' && (
//                                 <div className="text-[#bbbbbb]">
//                                     <div className="my-2">
//                                         <p>Quốc gia: {film.country_id}</p>
//                                     </div>
//                                     <div className="my-2">
//                                         <p>Năm phát hành: {film.year_id}</p>
//                                     </div>
//                                     <div className="my-2">
//                                         <p>Chất lượng: HD</p>
//                                     </div>
//                                     <div className="my-2">
//                                         <p>Thể loại: {film.genre}</p>
//                                     </div>
//                                     <div className="my-4">
//                                         <p>{film.content}</p>
//                                     </div>
//                                     <div className="my-4">
//                                         <p>Diễn viên: {film.actor}</p>
//                                     </div>
//                                     <div className="my-4">
//                                         <p>Đạo diễn: {film.director}</p>
//                                     </div>
//                                 </div>
//                             )}
//                             {tab == 'listEpisodes' && (
//                                 <div className="text-[#bbbbbb]">
//                                     {episodes.map((item: { episode_title: string }, index: number) => (
//                                         <button className={`px-3 py-2 rounded-2xl ${selectedEpisodeIndex === index ? 'bg-[#ff3c00]' : 'bg-[#000000]'}`} onClick={() => setSelectedEpisodeIndex(index)}>
//                                             {item.episode_title}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                             {tab == 'comment' && (
//                                 <>
//                                     <div className="w-full h-60 bg-white">
//                                         <div className="text-[#bbbbbb] flex items-center gap-2 pt-4">
//                                             <div className="ml-2">
//                                                 <UserCircleIcon className="h-10 w-10  border rounded-sm border-white  " />
//                                             </div>
//                                             <div tabIndex={0} className="group h-10  w-full mr-2 ">
//                                                 <input onFocus={() => { if (!isLoggedIn) { setShowCommentForm(true) } }} type="text" className="p-4 h-full w-full text-black border focus:outline-none focus:border-[#ff4c00]  rounded-sm border-gray-700" />
//                                             </div>
//                                             <div className="">
//                                                 <button className="w-14 h-10 rounded-sm bg-[#ff3c00] text-white mr-4">Đăng</button>
//                                             </div>
//                                         </div>
//                                     </div>

//                                 </>


//                             )}
//                             {showCommentForm && (
//                                 <div onClick={() => setShowCommentForm(false)} className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-50">
//                                     <div className="bg-white w-[400px] rounded-sm">
//                                         <div className="p-4">
//                                             <h2 className="pb-8">Bạn cần đăng nhập để bình luận</h2>
//                                             <div className="flex items-center justify-around h-full w-full">
//                                                 <button onClick={() => setShowCommentForm(false)} className="bg-black rounded-sm text-white hover:bg-[#e04300] w-24 h-10 cursor-pointer ">Thoát</button>
//                                                 <button
//                                                     className="bg-black rounded-sm text-white hover:bg-[#e04300] w-24 h-10 cursor-pointer"
//                                                     onClick={() => { setShowCommentForm(false); setShowLoginForm(true) }}
//                                                 >
//                                                     Đăng nhập
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )


//                             }
//                             {/* {showLoginForm && (
//                             <div className="fixed inset-0 flex items-center justify-center z-50">
//                                 <div className="bg-[#232f3e] w-[400px] rounded-sm" onClick={e => e.stopPropagation()}>
//                                 <Login onClose={() => setShowLoginForm(false)} />
//                                 </div>
//                             </div>
//                             )} */}
//                             {showLoginForm && renderLoginForm(() => setShowLoginForm(false))}
//                         </div>


//                     </div>
//                     <div className="grid col-span-3 "></div>
//                 </div>

//             </div>

//             <div className="col-span-2"></div>

//         </div>
//     );
// }

// export default FilmDetail;