import { useState } from "react";
import { useNavigate } from "react-router-dom";
import agent from "../api/agent";
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "2", // Default to Customer/User
  });

  const navigate = useNavigate();

  // Reset messages when switching forms
  const toggleForm = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!credentials.username || !credentials.password) {
      setError("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!");
      return;
    }

    try {
      const { data: users } = await agent.Users.list();
      const user = users.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password
      );

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setSuccess("Đăng nhập thành công!");
        setTimeout(() => {
          if (user.role === "0") navigate("/admin");
          else if (user.role === "1") navigate("/owner");
          else navigate("/user");
        }, 800);
      } else {
        setError("Tài khoản hoặc mật khẩu không chính xác!");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, phone, username, password, confirmPassword, role } = registerData;

    // Validation
    if (!fullName || !phone || !username || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin đăng ký!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      // Check if username already exists
      const { data: users } = await agent.Users.list();
      const userExists = users.some((u) => u.username === username);

      if (userExists) {
        setError("Tên tài khoản này đã được sử dụng!");
        return;
      }

      // Create new user object
      const newUser = {
        fullName,
        phone,
        username,
        password,
        role,
      };

      await agent.Users.create(newUser);
      setSuccess("Đăng ký tài khoản thành công! Đang chuyển về đăng nhập...");
      
      // Auto fill username to login and switch
      setCredentials({ username, password: "" });
      setTimeout(() => {
        setIsRegister(false);
        setError("");
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError("Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "85vh" }}
    >
      <Card style={{ width: "450px" }} className="border-0 shadow-lg rounded-4 overflow-hidden">
        <div 
          className="p-4 text-center text-white" 
          style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}
        >
          <h3 className="fw-bold m-0">{isRegister ? "ĐĂNG KÝ TÀI KHOẢN" : "ĐĂNG NHẬP HỆ THỐNG"}</h3>
          <p className="small m-0 mt-1 opacity-75">
            {isRegister ? "Tạo tài khoản mới để đặt sân bóng" : "Vui lòng đăng nhập để tiếp tục"}
          </p>
        </div>
        <Card.Body className="p-4 bg-light">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

          {!isRegister ? (
            /* LOGIN FORM */
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Tài khoản</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={credentials.username}
                  className="py-2 rounded-3 border-secondary-subtle"
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary">Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={credentials.password}
                  className="py-2 rounded-3 border-secondary-subtle"
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 rounded-3 fw-bold shadow-sm"
                style={{ backgroundColor: "#2a5298", borderColor: "#2a5298" }}
              >
                Vào hệ thống
              </Button>
            </Form>
          ) : (
            /* REGISTER FORM */
            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold text-secondary">Họ và tên</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={registerData.fullName}
                  className="py-2 rounded-3 border-secondary-subtle"
                  onChange={(e) =>
                    setRegisterData({ ...registerData, fullName: e.target.value })
                  }
                />
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold text-secondary">Số điện thoại</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="09xxxxxxxx"
                  value={registerData.phone}
                  className="py-2 rounded-3 border-secondary-subtle"
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-semibold text-secondary">Tên tài khoản</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="username"
                  value={registerData.username}
                  className="py-2 rounded-3 border-secondary-subtle"
                  onChange={(e) =>
                    setRegisterData({ ...registerData, username: e.target.value })
                  }
                />
              </Form.Group>

              <Row className="g-2 mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••"
                      value={registerData.password}
                      className="py-2 rounded-3 border-secondary-subtle"
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Xác nhận</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••"
                      value={registerData.confirmPassword}
                      className="py-2 rounded-3 border-secondary-subtle"
                      onChange={(e) =>
                        setRegisterData({ ...registerData, confirmPassword: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary">Vai trò</Form.Label>
                <Form.Select
                  value={registerData.role}
                  className="py-2 rounded-3 border-secondary-subtle"
                  onChange={(e) =>
                    setRegisterData({ ...registerData, role: e.target.value })
                  }
                >
                  <option value="2">Khách hàng (Đặt sân)</option>
                  <option value="1">Chủ sân bóng (Quản lý sân)</option>
                </Form.Select>
              </Form.Group>

              <Button 
                variant="success" 
                type="submit" 
                className="w-100 py-2 rounded-3 fw-bold shadow-sm"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
              >
                Đăng ký ngay
              </Button>
            </Form>
          )}

          <div className="text-center mt-3 small">
            {isRegister ? (
              <span>
                Đã có tài khoản?{" "}
                <Button variant="link" className="p-0 text-decoration-none fw-semibold" onClick={toggleForm}>
                  Đăng nhập
                </Button>
              </span>
            ) : (
              <span>
                Chưa có tài khoản?{" "}
                <Button variant="link" className="p-0 text-decoration-none fw-semibold" onClick={toggleForm}>
                  Đăng ký ngay
                </Button>
              </span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
