// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { error } from '../../../theme';
// import { toast } from 'sonner';

// export default function AdvertiseView() {
//   const [ads, setAds] = useState([]);
//   // const [newAd, setNewAd] = useState({ title: '', position: '', revenue: 0 });
//   const [customers,setCustomers] = useState([]);
//   const [campaigns,setCampaigns] = useState([]);
//   const [editingAd, setEditingAd] = useState(null); // quảng cáo đang chỉnh sửa
//   const [editForm, setEditForm] = useState({});     // dữ liệu form sửa

//   const [newAd, setNewAd] = useState({
//     title: '',
//     image: '',
//     start_date: '',
//     end_date: '',
//     deposit_amount: '',
//     is_deposited: false,
//     cost_per_view: '',
//     cost_per_click: '',
//     position: '',
//     url_shop: '',
//   });
//   // Thêm state cho số liệu thống kê
//   const [campaignStats, setCampaignStats] = useState({
//     views: 0,
//     clicks: 0,
//     revenue: 0,
//     isEnded: false,
//   });
//   const [showAddForm,setShowAddForm] = useState(false);

//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [imageFile, setImageFile] = useState(null);

//   const [showAddCustomerForm, setShowAddCustomerForm] = useState(false); // State cho form thêm khách hàng
//   const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' }); // State cho thông tin khách hàng mới

//   useEffect(() => {
//     axios.get('http://localhost:8000/api/admin/customers',{
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//     })
//           .then(response => {
//             setCustomers(response.data.customers)
//           })
//           .catch(error => {
//             console.error('Lỗi khi tải customer:', error);
//           })
//   },[]) 

//   const viewCampaigns = (customer) => {
//     setSelectedCustomer(customer);
//     axios.get(`http://localhost:8000/api/admin/ads-by-customer/${customer.id}`,{
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//       }
//     })
//       .then(response => {
//         setCampaigns(response.data.ads)
//       })
//       .catch(error => {
//         console.error('Lỗi khi tải campaign:', error);

//       })
//   }

//   // Lấy thống kê khi chọn chiến dịch
//   const fetchCampaignStats = async (campaignId) => {
//     try {
//       const response = await axios.get(`http://localhost:8000/api/admin/ad-campaign-stats/${campaignId}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//       setCampaignStats(response.data);
//     } catch (error) {
//       console.error('Lỗi khi tải thống kê:', error);
//       toast.error('Không thể tải thống kê chiến dịch');
//     }
//   };

//   const handleAddAd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedCustomer) {
//       toast.error("Chọn khách hàng trước");
//       return;
//     }
//     try {
//       const formData = new FormData();
//       formData.append("customer_id", selectedCustomer.id);
//       formData.append("title", newAd.title);
//       formData.append("start_date", newAd.start_date);
//       formData.append("end_date", newAd.end_date);
//       formData.append("deposit_amount", newAd.deposit_amount);
//       formData.append("is_deposited", newAd.is_deposited ? "1" : "0");
//       formData.append("cost_per_view", newAd.cost_per_view);
//       formData.append("cost_per_click", newAd.cost_per_click);
//       formData.append("position", newAd.position);
//       formData.append("url_shop", newAd.url_shop);
//       if (imageFile) {
//         formData.append("image", imageFile);
//       }
      
//       const res = await axios.post('http://localhost:8000/api/admin/ad-campaigns', formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           "Content-Type": "multipart/form-data"
//         }
//       });

//       toast.success("Thêm quảng cáo thành công!");

//       setNewAd({
//         title: '',
//         image: '',
//         start_date: '',
//         end_date: '',
//         deposit_amount: '',
//         is_deposited: false,
//         cost_per_view: '',
//         cost_per_click: '',
//         position: '',
//         url_shop: ''
//       });
//       setImageFile(null);
//       viewCampaigns(selectedCustomer); // reload lại danh sách

//     } catch (err) {

//       console.error("Lỗi khi thêm quảng cáo:", err.response?.status, err.response?.data);
//       toast.error("Thêm quảng cáo thất bại");
//     }
//   };

//   const handleAddCustomer = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         'http://localhost:8000/api/admin/add-customer', // Đường dẫn API để tạo khách hàng
//         {
//           name: newCustomer.name,
//           email: newCustomer.email,
//           phone: newCustomer.phone,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       toast.success('Thêm khách hàng thành công!');

//       // Cập nhật danh sách khách hàng
//       setCustomers([...customers, response.data.customer]);
//       setNewCustomer({ name: '', email: '', phone: '' });
//       setShowAddCustomerForm(false);
//     } catch (err) {
//       console.error('Lỗi khi thêm khách hàng:', err.response?.status, err.response?.data);
//       toast.error('Thêm khách hàng thất bại');
//     }
//   };


//   // const handleUpdateAd = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   try {
//   //     const formData = new FormData();
//   //     formData.append('customer_id', selectedCustomer.id);
//   //     formData.append("title", editForm.title);
//   //     formData.append("start_date", editForm.start_date);
//   //     formData.append("end_date", editForm.end_date);
//   //     formData.append("deposit_amount", editForm.deposit_amount);
//   //     formData.append("is_deposited", editForm.is_deposited ? "1" : "0");
//   //     formData.append("cost_per_view", editForm.cost_per_view);
//   //     formData.append("cost_per_click", editForm.cost_per_click);
//   //     formData.append("position", editForm.position);
//   //     formData.append("url_shop", editForm.url_shop);
//   //     // Xử lý ảnh
//   //     if (imageFile) {
//   //       formData.append('image', imageFile); // Gửi file ảnh mới nếu có
//   //     } else {
//   //       formData.append('image', editForm.image || ''); // Gửi URL ảnh cũ nếu không có file mới
//   //     }

//   //   console.log('formData:', Object.fromEntries(formData)); // Log để kiểm tra dữ liệu gửi đi

//   //     const res = await axios.put(
//   //       `http://localhost:8000/api/admin/update-ad/${editingAd.id}`,
//   //       formData,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${localStorage.getItem("token")}`,
//   //           "Content-Type": "multipart/form-data",
//   //         },
//   //       }
//   //     );

//   //     toast.success("Cập nhật quảng cáo thành công");
//   //     viewCampaigns(selectedCustomer); // Reload lại danh sách
//   //     setEditingAd(null);
//   //     setEditForm({});
//   //     setImageFile(null);
//   //   } catch (err) {
//   //     console.error("Lỗi khi cập nhật quảng cáo:", err.response?.data);
//   //     toast.error("Cập nhật quảng cáo thất bại");
//   //   }
//   // };

// const handleUpdateAd = async (e: React.FormEvent) => {
//   e.preventDefault();

//   // Kiểm tra selectedCustomer
//   if (!selectedCustomer || !selectedCustomer.id) {
//     console.error('selectedCustomer is invalid:', selectedCustomer);
//     toast.error('Vui lòng chọn khách hàng trước khi cập nhật');
//     return;
//   }

//   // Kiểm tra các trường bắt buộc trong editForm
//   const requiredFields = [
//     { key: 'title', value: editForm.title, label: 'Tiêu đề', type: 'string' },
//     { key: 'start_date', value: editForm.start_date, label: 'Ngày bắt đầu', type: 'date' },
//     { key: 'end_date', value: editForm.end_date, label: 'Ngày kết thúc', type: 'date' },
//     { key: 'deposit_amount', value: editForm.deposit_amount, label: 'Tiền cọc', type: 'numeric' },
//     { key: 'cost_per_view', value: editForm.cost_per_view, label: 'Chi phí view', type: 'numeric' },
//     { key: 'cost_per_click', value: editForm.cost_per_click, label: 'Chi phí click', type: 'numeric' },
//     { key: 'position', value: editForm.position, label: 'Vị trí', type: 'string' },
//     { key: 'url_shop', value: editForm.url_shop, label: 'Link shop', type: 'url' },
//   ];

//   for (const field of requiredFields) {
//     if (!field.value || field.value === '') {
//       console.error(`Validation failed: ${field.label} is empty`, field.value);
//       toast.error(`${field.label} là bắt buộc`);
//       return;
//     }
//     if (field.type === 'numeric' && (isNaN(field.value) || field.value < 0)) {
//       console.error(`Validation failed: ${field.label} must be a valid number`, field.value);
//       toast.error(`${field.label} phải là số hợp lệ`);
//       return;
//     }
//     if (field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(field.value)) {
//       console.error(`Validation failed: ${field.label} must be a valid date (YYYY-MM-DD)`, field.value);
//       toast.error(`${field.label} phải có định dạng ngày hợp lệ (YYYY-MM-DD)`);
//       return;
//     }
//     if (field.type === 'url' && !/^(https?:\/\/)/.test(field.value)) {
//       console.error(`Validation failed: ${field.label} must be a valid URL`, field.value);
//       toast.error(`${field.label} phải là URL hợp lệ`);
//       return;
//     }
//   }

//   try {
//     const formData = new FormData();
//     formData.append('customer_id', selectedCustomer.id.toString());
//     formData.append('title', editForm.title);
//     formData.append('start_date', editForm.start_date);
//     formData.append('end_date', editForm.end_date);
//     formData.append('deposit_amount', editForm.deposit_amount.toString());
//     formData.append('is_deposited', editForm.is_deposited ? '1' : '0');
//     formData.append('cost_per_view', editForm.cost_per_view.toString());
//     formData.append('cost_per_click', editForm.cost_per_click.toString());
//     formData.append('position', editForm.position);
//     formData.append('url_shop', editForm.url_shop);
//     if (imageFile) {
//       formData.append('image', imageFile);
//     } else {
//       formData.append('image', editForm.image || '');
//     }

//     // Log FormData chi tiết
//     console.log('formData entries:');
//     for (const [key, value] of formData.entries()) {
//       console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
//     }

//     const res = await axios.post(
//       `http://localhost:8000/api/admin/update-ad/${editingAd.id}`,
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           // 'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     toast.success('Cập nhật quảng cáo thành công');
//     viewCampaigns(selectedCustomer);
//     setEditingAd(null);
//     setEditForm({});
//     setImageFile(null);
//   } catch (err) {
//           console.log('=== FULL ERROR DEBUG ===');
//     console.log('Status:', err.response?.status);
//     console.log('Status Text:', err.response?.statusText);
//     console.log('Headers:', err.response?.headers);
//     console.log('Full Response Data:', err.response?.data);
//     console.log('Request URL:', err.config?.url);
//     console.log('Request Method:', err.config?.method);
//     console.log('Request Headers:', err.config?.headers);
//     console.error('Lỗi khi cập nhật quảng cáo:', err.response?.data);
//     if (err.response?.data?.errors) {
//       const errorMessages = Object.entries(err.response.data.errors)
//         .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
//         .join('; ');
//       toast.error(`Cập nhật quảng cáo thất bại: ${errorMessages}`);
//     } else {
//       toast.error(`Cập nhật quảng cáo thất bại: ${err.response?.data.message || err.message}`);
//     }
//   }
// };


//   return (
//     <div className="p-4 bg-white rounded-md">
//       <h2 className="text-xl font-bold mb-4">Quản lý quảng cáo</h2>

//       <div className="mb-4 flex items-center justify-between">
//         <h2 className='font-bold'>Danh sách khách hàng</h2>
//         <div ><button onClick={() => setShowAddCustomerForm(true)} className='bg-blue-700 text-white cursor-pointer rounded-xl p-2'>Thêm khách hàng</button></div>
//       </div>

//       {/* Form thêm khách hàng */}
//       {showAddCustomerForm && (
//         <form onSubmit={handleAddCustomer} className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded mb-6">
//           <input
//             type="text"
//             placeholder="Tên khách hàng"
//             value={newCustomer.name}
//             onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
//             className="border p-2 rounded"
//             required
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={newCustomer.email}
//             onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
//             className="border p-2 rounded"
//             required
//           />
//           <input
//             type="tel"
//             placeholder="Số điện thoại"
//             value={newCustomer.phone}
//             onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
//             className="border p-2 rounded"
//             required
//           />
//           <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded">
//             Lưu khách hàng
//           </button>
//           <button
//             type="button"
//             onClick={() => setShowAddCustomerForm(false)}
//             className="col-span-2 bg-red-600 text-white p-2 rounded mt-2"
//           >
//             Hủy
//           </button>
//         </form>
//       )}

//       <div className='flex items-center justify-between font-bold'>
//         <p>Tên</p>
//         <p>Email</p>
//         <p>Số điện thoại</p>
//         <p>Quảng cáo</p>
//       </div>

//       {/* {customers.map((item,index) => (
//         <div key={index} className='flex items-center justify-between'>
//             <p>{item.name}</p>
//             <p>{item.email}</p>
//             <p>{item.phone}</p>
//             <button className='text-blue-600 underline cursor-pointer' onClick={() => viewCampaigns(item)}>Chi tiết quảng cáo</button>
//         </div>
//       ))

//       } */}

//       {customers.map((item, index) => (
//         <div key={index} className="flex items-center justify-between">
//           <p>{item.name}</p>
//           <p>{item.email}</p>
//           <p>{item.phone}</p>
//           <button
//             className="text-blue-600 underline cursor-pointer"
//             onClick={() => {
//               viewCampaigns(item);
//               if (campaigns.length > 0) fetchCampaignStats(campaigns[0].id); // Lấy thống kê khi chọn khách hàng
//             }}
//           >
//             Chi tiết quảng cáo
//           </button>
//         </div>
//       ))}
//       {selectedCustomer && (
//         <div className='mt-8'>
//           <h3 className="text-lg font-bold mb-2">
//             Chi tiết quảng cáo của: {selectedCustomer.name}
//           </h3>

//           {/* Nút Thêm quảng cáo */}
//           <div className='mb-4'>
//             <button
//               onClick={() => setShowAddForm(!showAddForm)}
//               className='bg-blue-600 text-white px-4 py-2 rounded'
//             >
//               {showAddForm ? 'Đóng' : 'Thêm quảng cáo'}
//             </button>
//           </div>

//           {/* Form thêm quảng cáo */}
//           {showAddForm && (
//             <form
//               onSubmit={handleAddAd}
//               className='grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded mb-6'
//             >
//               {/* Các input giống như ở bước trước đã làm */}
//               <input
//                 type="text"
//                 placeholder="Tiêu đề"
//                 value={newAd.title}
//                 onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
//                 className="border p-2 rounded"
//                 required
//               />
//               <input
//                 type="file"
//                 accept='image/*'
//                 placeholder="Ảnh quảng cáo"
//                 onChange={(e) => setImageFile(e.target.files[0])}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="date"
//                 value={newAd.start_date}
//                 onChange={(e) => setNewAd({ ...newAd, start_date: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="date"
//                 value={newAd.end_date}
//                 onChange={(e) => setNewAd({ ...newAd, end_date: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="number"
//                 placeholder="Tiền cọc"
//                 value={newAd.deposit_amount}
//                 onChange={(e) => setNewAd({ ...newAd, deposit_amount: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <select
//                 value={newAd.is_deposited}
//                 onChange={(e) => setNewAd({ ...newAd, is_deposited: e.target.value === 'true' })}
//                 className="border p-2 rounded"
//               >
//                 <option value="false">Chưa cọc</option>
//                 <option value="true">Đã cọc</option>
//               </select>
//               <input
//                 type="number"
//                 placeholder="Chi phí view"
//                 value={newAd.cost_per_view}
//                 onChange={(e) => setNewAd({ ...newAd, cost_per_view: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="number"
//                 placeholder="Chi phí click"
//                 value={newAd.cost_per_click}
//                 onChange={(e) => setNewAd({ ...newAd, cost_per_click: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <select
//                 value={newAd.position}
//                 onChange={e => setNewAd({ ...newAd, position: e.target.value })}
//                 className="border p-2 rounded"
//                 required
//               >
//                 <option value="">Nơi đặt quảng cáo</option>
//                 <option value="update">Phim mới cập nhật</option>
//                 <option value="ranking">Phim bảng xếp hạng</option>
//               </select>
//               <input
//                 type="text"
//                 placeholder="Link shop"
//                 value={newAd.url_shop}
//                 onChange={(e) => setNewAd({ ...newAd, url_shop: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded">
//                 Lưu quảng cáo
//               </button>
//             </form>
//           )}

//           {/* Bảng quảng cáo */}
//           {campaigns.length === 0 ? (
//             <p>Không có quảng cáo nào.</p>
//           ) : (
//             <table className='w-full border mt-2'>
//               <thead>
//                 <tr className='bg-gray-100'>
//                   <th className='border p-2'>Tiêu đề</th>
//                   <th className='border p-2'>Ảnh quảng cáo</th>
//                   <th className='border p-2'>Ngày bắt đầu quảng cáo</th>
//                   <th className='border p-2'>Ngày kết thúc quảng cáo</th>
//                   <th className='border p-2'>Tiền cọc</th>
//                   <th className='border p-2'>Đã cọc</th>
//                   <th className='border p-2'>Chi phí quảng cáo view</th>
//                   <th className='border p-2'>Chi phí quảng cáo click</th>
//                   <th className='border p-2'>Vị trí quảng cáo</th>
//                   <th className='border p-2'>Link shop</th>
//                   <th className='border p-2'>Lượt xem</th>
//                   <th className='border p-2'>Lượt click</th>
//                   <th className='border p-2'>Doanh thu</th>
//                   <th className='border p-2'>Trạng thái</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {campaigns.map((ad, idx) => (
//                   <tr key={idx}>
//                     <td className='border p-2'>{ad.title}</td>
//                     <td className='border p-2'>
//                       {ad.image
//                         ? <img src={ad.image} alt={ad.title} className="w-20 h-12 object-cover rounded" />
//                         : '—'
//                       }
//                     </td>
//                     <td className='border p-2'>{ad.start_date}</td>
//                     <td className='border p-2'>{ad.end_date}</td>
//                     <td className='border p-2'>{ad.deposit_amount}</td>
//                     <td className='border p-2'>{ad.is_deposited === 1 ? "Đã cọc" : "Chưa cọc"}</td>
//                     <td className='border p-2'>{ad.cost_per_view}</td>
//                     <td className='border p-2'>{ad.cost_per_click}</td>
//                     <td className='border p-2'>{ad.position}</td>
//                     <td className='border p-2'>{ad.url_shop}</td>
//                     <td className='border p-2'>{ad.views}</td>
//                     <td className='border p-2'>{ad.clicks}</td>
//                     <td className='border p-2'>{ad.revenue}</td>
//                     <td className='border p-2'>
//                       {ad.is_ended ? <span className='text-red-600'>Đã kết thúc</span> : <span className='text-green-600'>Đang chạy</span>}
//                     </td>
//                     <td className="border p-2">
//                       <button
//                         className="bg-blue-700 p-2 rounded-md"
//                         onClick={() => {
//                           console.log('Ad:', ad);
//                           setEditingAd(ad);
//                           setEditForm(ad);
//                         }}
//                       >
//                         Sửa
//                       </button>
//                     </td>

//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}

//           {editingAd && (
//             <form
//               onSubmit={handleUpdateAd}
//               className="mt-6 p-4 bg-yellow-100 rounded grid grid-cols-2 gap-4"
//             >
//               <h3 className="col-span-2 font-bold text-lg">Chỉnh sửa quảng cáo: {editingAd.title}</h3>

//               <input
//                 type="text"
//                 placeholder="Tiêu đề"
//                 value={editForm.title || ''}
//                 onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setImageFile(e.target.files[0])}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="date"
//                 value={editForm.start_date || ''}
//                 onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="date"
//                 value={editForm.end_date || ''}
//                 onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="number"
//                 placeholder="Tiền cọc"
//                 value={editForm.deposit_amount || ''}
//                 onChange={(e) => setEditForm({ ...editForm, deposit_amount: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <select
//                 value={editForm.is_deposited ? "true" : "false"}
//                 onChange={(e) => setEditForm({ ...editForm, is_deposited: e.target.value === "true" })}
//                 className="border p-2 rounded"
//               >
//                 <option value="false">Chưa cọc</option>
//                 <option value="true">Đã cọc</option>
//               </select>
//               <input
//                 type="number"
//                 placeholder="Chi phí view"
//                 value={editForm.cost_per_view || ''}
//                 onChange={(e) => setEditForm({ ...editForm, cost_per_view: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <input
//                 type="number"
//                 placeholder="Chi phí click"
//                 value={editForm.cost_per_click || ''}
//                 onChange={(e) => setEditForm({ ...editForm, cost_per_click: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <select
//                 value={editForm.position || ''}
//                 onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
//                 className="border p-2 rounded"
//               >
//                 <option value="">Vị trí quảng cáo</option>
//                 <option value="update">Phim mới cập nhật</option>
//                 <option value="ranking">Phim bảng xếp hạng</option>
//               </select>
//               <input
//                 type="text"
//                 placeholder="Link shop"
//                 value={editForm.url_shop || ''}
//                 onChange={(e) => setEditForm({ ...editForm, url_shop: e.target.value })}
//                 className="border p-2 rounded"
//               />
//               <button
//                 type="submit"
//                 className="col-span-2 bg-blue-600 text-white p-2 rounded"
//               >
//                 Cập nhật quảng cáo
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
                  
//                   setEditingAd(null);
//                   setEditForm({});
//                 }}
//                 className="col-span-2 bg-gray-500 text-white p-2 rounded"
//               >
//                 Hủy chỉnh sửa
//               </button>
//             </form>
//           )}

//         </div>
//       )}


//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Hàm để định dạng ngày
const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('vi-VN') : '—';
};

export default function AdvertiseView() {
  const [ads, setAds] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [editingAd, setEditingAd] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newAd, setNewAd] = useState({
    title: '',
    image: '',
    start_date: '',
    end_date: '',
    deposit_amount: '',
    is_deposited: false,
    cost_per_view: '',
    cost_per_click: '',
    position: '',
    url_shop: '',
  });
  const [campaignStats, setCampaignStats] = useState({
    views: 0,
    clicks: 0,
    revenue: 0,
    isEnded: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Số khách hàng mỗi trang
  const [loading, setLoading] = useState(false);

  // Tính toán dữ liệu phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  // Lấy danh sách khách hàng
  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:8000/api/admin/customers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setCustomers(response.data.customers);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi tải khách hàng:', error);
        toast.error('Không thể tải danh sách khách hàng');
        setLoading(false);
      });
  }, []);

  // Lấy danh sách chiến dịch quảng cáo
  const viewCampaigns = (customer) => {
    setSelectedCustomer(customer);
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/admin/ads-by-customer/${customer.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setCampaigns(response.data.ads);
        if (response.data.ads.length > 0) fetchCampaignStats(response.data.ads[0].id);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi tải chiến dịch:', error);
        toast.error('Không thể tải danh sách chiến dịch');
        setLoading(false);
      });
  };

  // Lấy thống kê chiến dịch
  const fetchCampaignStats = async (campaignId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/admin/ad-campaign-stats/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCampaignStats(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      toast.error('Không thể tải thống kê chiến dịch');
    }
  };

  // Xử lý thêm quảng cáo
  const handleAddAd = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng trước');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('customer_id', selectedCustomer.id);
      formData.append('title', newAd.title);
      formData.append('start_date', newAd.start_date);
      formData.append('end_date', newAd.end_date);
      formData.append('deposit_amount', newAd.deposit_amount);
      formData.append('is_deposited', newAd.is_deposited ? '1' : '0');
      formData.append('cost_per_view', newAd.cost_per_view);
      formData.append('cost_per_click', newAd.cost_per_click);
      formData.append('position', newAd.position);
      formData.append('url_shop', newAd.url_shop);
      if (imageFile) formData.append('image', imageFile);

      await axios.post('http://localhost:8000/api/admin/ad-campaigns', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Thêm quảng cáo thành công!');
      setNewAd({
        title: '',
        image: '',
        start_date: '',
        end_date: '',
        deposit_amount: '',
        is_deposited: false,
        cost_per_view: '',
        cost_per_click: '',
        position: '',
        url_shop: '',
      });
      setImageFile(null);
      viewCampaigns(selectedCustomer);
      setShowAddForm(false);
    } catch (err) {
      console.error('Lỗi khi thêm quảng cáo:', err.response?.data);
      toast.error('Thêm quảng cáo thất bại');
    }
  };

  // Xử lý thêm khách hàng
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/api/admin/add-customer',
        {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Thêm khách hàng thành công!');
      setCustomers([...customers, response.data.customer]);
      setNewCustomer({ name: '', email: '', phone: '' });
      setShowAddCustomerForm(false);
    } catch (err) {
      console.error('Lỗi khi thêm khách hàng:', err.response?.data);
      toast.error('Thêm khách hàng thất bại');
    }
  };

  // Xử lý cập nhật quảng cáo
  const handleUpdateAd = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedCustomer.id) {
      toast.error('Vui lòng chọn khách hàng trước khi cập nhật');
      return;
    }

    const requiredFields = [
      { key: 'title', value: editForm.title, label: 'Tiêu đề', type: 'string' },
      { key: 'start_date', value: editForm.start_date, label: 'Ngày bắt đầu', type: 'date' },
      { key: 'end_date', value: editForm.end_date, label: 'Ngày kết thúc', type: 'date' },
      { key: 'deposit_amount', value: editForm.deposit_amount, label: 'Tiền cọc', type: 'numeric' },
      { key: 'cost_per_view', value: editForm.cost_per_view, label: 'Chi phí view', type: 'numeric' },
      { key: 'cost_per_click', value: editForm.cost_per_click, label: 'Chi phí click', type: 'numeric' },
      { key: 'position', value: editForm.position, label: 'Vị trí', type: 'string' },
      { key: 'url_shop', value: editForm.url_shop, label: 'Link shop', type: 'url' },
    ];

    for (const field of requiredFields) {
      if (!field.value || field.value === '') {
        toast.error(`${field.label} là bắt buộc`);
        return;
      }
      if (field.type === 'numeric' && (isNaN(field.value) || field.value < 0)) {
        toast.error(`${field.label} phải là số hợp lệ`);
        return;
      }
      if (field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(field.value)) {
        toast.error(`${field.label} phải có định dạng ngày hợp lệ (YYYY-MM-DD)`);
        return;
      }
      if (field.type === 'url' && !/^(https?:\/\/)/.test(field.value)) {
        toast.error(`${field.label} phải là URL hợp lệ`);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('customer_id', selectedCustomer.id.toString());
      formData.append('title', editForm.title);
      formData.append('start_date', editForm.start_date);
      formData.append('end_date', editForm.end_date);
      formData.append('deposit_amount', editForm.deposit_amount.toString());
      formData.append('is_deposited', editForm.is_deposited ? '1' : '0');
      formData.append('cost_per_view', editForm.cost_per_view.toString());
      formData.append('cost_per_click', editForm.cost_per_click.toString());
      formData.append('position', editForm.position);
      formData.append('url_shop', editForm.url_shop);
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('image', editForm.image || '');
      }

      await axios.post(`http://localhost:8000/api/admin/update-ad/${editingAd.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast.success('Cập nhật quảng cáo thành công');
      viewCampaigns(selectedCustomer);
      setEditingAd(null);
      setEditForm({});
      setImageFile(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật quảng cáo:', err.response?.data);
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        toast.error(`Cập nhật quảng cáo thất bại: ${errorMessages}`);
      } else {
        toast.error(`Cập nhật quảng cáo thất bại: ${err.response?.data.message || err.message}`);
      }
    }
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý quảng cáo</h2>

      {/* Form thêm khách hàng */}
      {showAddCustomerForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Thêm khách hàng mới</h3>
          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="md:col-span-3 flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
              >
                Lưu khách hàng
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustomerForm(false)}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách khách hàng */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Danh sách khách hàng</h3>
          <button
            onClick={() => setShowAddCustomerForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Thêm khách hàng
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Đang tải...</div>
        ) : customers.length === 0 ? (
          <div className="text-center text-gray-500">Không có khách hàng nào.</div>
        ) : (
          <div className="space-y-4">
            {currentCustomers.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-gray-600">{item.email}</p>
                  <p className="text-gray-600">{item.phone}</p>
                </div>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    viewCampaigns(item);
                    if (campaigns.length > 0) fetchCampaignStats(campaigns[0].id);
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                } transition`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Chi tiết quảng cáo của khách hàng */}
      {selectedCustomer && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Chi tiết quảng cáo của: {selectedCustomer.name}
          </h3>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Đóng form' : 'Thêm quảng cáo'}
          </button>

          {/* Form thêm quảng cáo */}
          {showAddForm && (
            <form
              onSubmit={handleAddAd}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-md mb-6"
            >
              <input
                type="text"
                placeholder="Tiêu đề"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border p-3 rounded-lg"
              />
              <input
                type="date"
                value={newAd.start_date}
                onChange={(e) => setNewAd({ ...newAd, start_date: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newAd.end_date}
                onChange={(e) => setNewAd({ ...newAd, end_date: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Tiền cọc"
                value={newAd.deposit_amount}
                onChange={(e) => setNewAd({ ...newAd, deposit_amount: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newAd.is_deposited}
                onChange={(e) => setNewAd({ ...newAd, is_deposited: e.target.value === 'true' })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Chưa cọc</option>
                <option value="true">Đã cọc</option>
              </select>
              <input
                type="number"
                placeholder="Chi phí view"
                value={newAd.cost_per_view}
                onChange={(e) => setNewAd({ ...newAd, cost_per_view: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Chi phí click"
                value={newAd.cost_per_click}
                onChange={(e) => setNewAd({ ...newAd, cost_per_click: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newAd.position}
                onChange={(e) => setNewAd({ ...newAd, position: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Nơi đặt quảng cáo</option>
                <option value="update">Phim mới cập nhật</option>
                <option value="ranking">Phim bảng xếp hạng</option>
              </select>
              <input
                type="text"
                placeholder="Link shop"
                value={newAd.url_shop}
                onChange={(e) => setNewAd({ ...newAd, url_shop: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="md:col-span-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
              >
                Lưu quảng cáo
              </button>
            </form>
          )}

          {/* Bảng quảng cáo */}
          {campaigns.length === 0 ? (
            <p className="text-gray-500">Không có quảng cáo nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border p-3 text-left">Tiêu đề</th>
                    <th className="border p-3 text-left">Ảnh</th>
                    <th className="border p-3 text-left">Ngày bắt đầu</th>
                    <th className="border p-3 text-left">Ngày kết thúc</th>
                    <th className="border p-3 text-left">Tiền cọc</th>
                    <th className="border p-3 text-left">Đã cọc</th>
                    <th className="border p-3 text-left">Chi phí view</th>
                    <th className="border p-3 text-left">Chi phí click</th>
                    <th className="border p-3 text-left">Vị trí</th>
                    <th className="border p-3 text-left">Link shop</th>
                    <th className="border p-3 text-left">Lượt xem</th>
                    <th className="border p-3 text-left">Lượt click</th>
                    <th className="border p-3 text-left">Doanh thu</th>
                    <th className="border p-3 text-left">Trạng thái</th>
                    <th className="border p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((ad, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-3">{ad.title}</td>
                      <td className="border p-3">
                        {ad.image ? (
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="border p-3">{formatDate(ad.start_date)}</td>
                      <td className="border p-3">{formatDate(ad.end_date)}</td>
                      <td className="border p-3">{ad.deposit_amount}</td>
                      <td className="border p-3">{ad.is_deposited === 1 ? 'Đã cọc' : 'Chưa cọc'}</td>
                      <td className="border p-3">{ad.cost_per_view}</td>
                      <td className="border p-3">{ad.cost_per_click}</td>
                      <td className="border p-3">{ad.position}</td>
                      <td className="border p-3">
                        <a href={ad.url_shop} target="_blank" className="text-blue-600 hover:underline">
                          Link
                        </a>
                      </td>
                      <td className="border p-3">{ad.views}</td>
                      <td className="border p-3">{ad.clicks}</td>
                      <td className="border p-3">{ad.revenue}</td>
                      <td className="border p-3">
                        {ad.is_ended ? (
                          <span className="text-red-600">Đã kết thúc</span>
                        ) : (
                          <span className="text-green-600">Đang chạy</span>
                        )}
                      </td>
                      <td className="border p-3">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                          onClick={() => {
                            setEditingAd(ad);
                            setEditForm(ad);
                          }}
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Form chỉnh sửa quảng cáo */}
          {editingAd && (
            <form
              onSubmit={handleUpdateAd}
              className="mt-6 p-6 bg-yellow-50 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <h3 className="md:col-span-2 font-bold text-lg text-gray-800">
                Chỉnh sửa quảng cáo: {editingAd.title}
              </h3>
              <input
                type="text"
                placeholder="Tiêu đề"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border p-3 rounded-lg"
              />
              <input
                type="date"
                value={editForm.start_date || ''}
                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={editForm.end_date || ''}
                onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Tiền cọc"
                value={editForm.deposit_amount || ''}
                onChange={(e) => setEditForm({ ...editForm, deposit_amount: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editForm.is_deposited ? 'true' : 'false'}
                onChange={(e) => setEditForm({ ...editForm, is_deposited: e.target.value === 'true' })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Chưa cọc</option>
                <option value="true">Đã cọc</option>
              </select>
              <input
                type="number"
                placeholder="Chi phí view"
                value={editForm.cost_per_view || ''}
                onChange={(e) => setEditForm({ ...editForm, cost_per_view: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Chi phí click"
                value={editForm.cost_per_click || ''}
                onChange={(e) => setEditForm({ ...editForm, cost_per_click: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editForm.position || ''}
                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Vị trí quảng cáo</option>
                <option value="update">Phim mới cập nhật</option>
                <option value="ranking">Phim bảng xếp hạng</option>
              </select>
              <input
                type="text"
                placeholder="Link shop"
                value={editForm.url_shop || ''}
                onChange={(e) => setEditForm({ ...editForm, url_shop: e.target.value })}
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Cập nhật quảng cáo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAd(null);
                    setEditForm({});
                  }}
                  className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
                >
                  Hủy chỉnh sửa
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}