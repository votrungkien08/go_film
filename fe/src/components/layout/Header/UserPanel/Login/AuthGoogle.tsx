import { useEffect } from "react";
import { toast } from "sonner";

export default function AuthGoogle() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      toast.success("Đăng nhập Google thành công!");
      if (window.opener) {
        window.opener.postMessage({ type: "GOOGLE_LOGIN_SUCCESS", token }, "*");
        window.close(); // đóng popup
      } else {
        window.location.href = "/";
      }
    } else {
      toast.error("Không nhận được token từ Google!");
      window.close();
    }
  }, []);

  return (
    <div className="text-center text-white mt-10">
      Đang xử lý đăng nhập Google...
    </div>
  );
}
