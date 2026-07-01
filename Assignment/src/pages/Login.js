import { useState } from "react";
import { useNavigate } from "react-router-dom";
import agent from "../api/agent";
import { Container, Card, Form, Button } from "react-bootstrap";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data: users } = await agent.Users.list();
    const user = users.find(
      (u) =>
        u.username === credentials.username &&
        u.password === credentials.password,
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // Điều hướng dựa trên role
      if (user.role === "0") navigate("/admin");
      else if (user.role === "1") navigate("/owner");
      else navigate("/user");
    } else {
      alert("Thông tin đăng nhập không chính xác!");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card style={{ width: "400px" }} className="shadow">
        <Card.Body>
          <Card.Title className="text-center mb-4">ĐĂNG NHẬP</Card.Title>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Tài khoản</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Vào hệ thống
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
