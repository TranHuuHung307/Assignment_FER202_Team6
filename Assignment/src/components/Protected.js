import { Navigate } from 'react-router-dom';

const Protected = ({ children, allowedRole }) => {
  // 1. Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. Nếu chưa đăng nhập -> Đá về trang Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu đã đăng nhập nhưng sai Role -> Thông báo hoặc đẩy về trang phù hợp
  // Lưu ý: user.role từ db.json của bạn là kiểu String ("0", "1", "2")
  if (allowedRole && user.role !== allowedRole) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Truy cập bị từ chối!</h2>
        <p>Bạn không có quyền xem trang này.</p>
        <button onClick={() => window.history.back()}>Quay lại</button>
      </div>
    );
  }

  return children;
};

export default Protected;