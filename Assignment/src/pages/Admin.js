import { useState, useEffect } from "react";
import agent from "../api/agent";
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Tabs,
  Tab,
  Card,
} from "react-bootstrap";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [fields, setFields] = useState([]);

  // 👇 control show form
  const [showUserForm, setShowUserForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);

  const [userForm, setUserForm] = useState({
    id: null,
    fullName: "",
    username: "",
    password: "",
    role: "2",
  });

  const [fieldForm, setFieldForm] = useState({
    id: null,
    fieldName: "",
    location: "",
    price: 0,
    ownerId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [u, f] = await Promise.all([
      agent.Users.list(),
      agent.Fields.list(),
    ]);
    setUsers(u.data);
    setFields(f.data);
  };

  // ================= USER =================
  const handleSaveUser = async () => {
    if (!userForm.fullName || !userForm.username)
      return alert("Nhập thiếu!");

    if (userForm.id) {
      await agent.Users.update(userForm.id, userForm);
    } else {
      await agent.Users.update("", {
        ...userForm,
        id: Date.now().toString(),
      });
    }

    setUserForm({
      id: null,
      fullName: "",
      username: "",
      password: "",
      role: "2",
    });
    setShowUserForm(false);
    loadData();
  };

  const deleteUser = async (id) => {
    if (window.confirm("Xoá user?")) {
      await agent.Users.delete(id);
      loadData();
    }
  };

  // ================= FIELD =================
  const handleSaveField = async () => {
    if (!fieldForm.fieldName || !fieldForm.ownerId)
      return alert("Thiếu info!");

    const data = {
      ...fieldForm,
      ownerId: parseInt(fieldForm.ownerId),
      price: parseInt(fieldForm.price),
    };

    if (fieldForm.id) {
      await agent.Fields.update(fieldForm.id, data);
    } else {
      await agent.Fields.create({
        ...data,
        id: Date.now().toString(),
      });
    }

    setFieldForm({
      id: null,
      fieldName: "",
      location: "",
      price: 0,
      ownerId: "",
    });
    setShowFieldForm(false);
    loadData();
  };

  const deleteField = async (id) => {
    if (window.confirm("Xoá sân?")) {
      await agent.Fields.delete(id);
      loadData();
    }
  };

  return (
    <Container className="py-4">
      <h2 className="text-primary fw-bold mb-4">
        Hệ Thống Quản Trị
      </h2>

      <Tabs defaultActiveKey="users">

        {/* ================= USERS ================= */}
        <Tab eventKey="users" title="Người dùng">

          {showUserForm && (
            <Card className="mb-3">
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Control
                      placeholder="Họ tên"
                      value={userForm.fullName}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      placeholder="Username"
                      value={userForm.username}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="0">Admin</option>
                      <option value="1">Chủ sân</option>
                      <option value="2">Khách</option>
                    </Form.Select>
                  </Col>

                  <Col md={2}>
                    <Button onClick={handleSaveUser} className="w-100">
                      Lưu
                    </Button>
                  </Col>

                  <Col md={2}>
                    <Button
                      variant="secondary"
                      className="w-100"
                      onClick={() => {
                        setShowUserForm(false);
                      }}
                    >
                      Hủy
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Table bordered>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>User</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => {
                        setUserForm(u);
                        setShowUserForm(true);
                      }}
                    >
                      Sửa
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteUser(u.id)}
                    >
                      Xoá
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        {/* ================= FIELDS ================= */}
        <Tab eventKey="fields" title="Sân bóng">

          {showFieldForm && (
            <Card className="mb-3">
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Control
                      placeholder="Tên sân"
                      value={fieldForm.fieldName}
                      onChange={(e) =>
                        setFieldForm({
                          ...fieldForm,
                          fieldName: e.target.value,
                        })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      placeholder="Địa điểm"
                      value={fieldForm.location}
                      onChange={(e) =>
                        setFieldForm({
                          ...fieldForm,
                          location: e.target.value,
                        })
                      }
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Giá"
                      value={fieldForm.price}
                      onChange={(e) =>
                        setFieldForm({
                          ...fieldForm,
                          price: e.target.value,
                        })
                      }
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Select
                      value={fieldForm.ownerId}
                      onChange={(e) =>
                        setFieldForm({
                          ...fieldForm,
                          ownerId: e.target.value,
                        })
                      }
                    >
                      <option value="">Chủ sân</option>
                      {users
                        .filter((u) => u.role === "1")
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.fullName}
                          </option>
                        ))}
                    </Form.Select>
                  </Col>

                  <Col md={1}>
                    <Button onClick={handleSaveField}>Lưu</Button>
                  </Col>

                  <Col md={1}>
                    <Button
                      variant="secondary"
                      onClick={() => setShowFieldForm(false)}
                    >
                      Hủy
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Table bordered>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Địa điểm</th>
                <th>Giá</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.fieldName}</td>
                  <td>{f.location}</td>
                  <td>{f.price}</td>
                  <td>{f.ownerId}</td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => {
                        setFieldForm(f);
                        setShowFieldForm(true);
                      }}
                    >
                      Sửa
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteField(f.id)}
                    >
                      Xoá
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Admin;