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
  const [bookings, setBookings] = useState([]);

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
    const [u, f, b] = await Promise.all([
      agent.Users.list(),
      agent.Fields.list(),
      agent.Bookings.list(),
    ]);
    setUsers(u.data);
    setFields(f.data);
    setBookings(b.data);
  };

  // ================= USER =================
  const handleSaveUser = async () => {
    if (!userForm.fullName || !userForm.username)
      return alert("Nhập thiếu!");

    if (userForm.id) {
      await agent.Users.update(userForm.id, userForm);
    } else {
      await agent.Users.create({
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

  // ================= REVENUE STATISTICS =================
  const getAdminRevenueData = () => {
    const monthlyData = {};

    bookings.forEach((b) => {
      const field = fields.find((f) => String(f.id) === String(b.fieldId));
      const price = field ? field.price : 0;
      const fieldName = field ? field.fieldName : "Sân không xác định";
      
      if (!b.timeSlot) return;
      const datePart = b.timeSlot.split(" ")[0];
      const parts = datePart.split("-");
      if (parts.length < 2) return;
      
      const year = parts[0];
      const month = parts[1];
      const sortKey = `${year}-${month}`; // YYYY-MM for sorting
      const displayKey = `${month}/${year}`; // MM/YYYY for display

      if (!monthlyData[sortKey]) {
        monthlyData[sortKey] = {
          display: displayKey,
          revenue: 0,
          count: 0,
          fieldsDetail: {}
        };
      }
      monthlyData[sortKey].revenue += price;
      monthlyData[sortKey].count += 1;

      // Group by fieldName
      if (!monthlyData[sortKey].fieldsDetail[fieldName]) {
        monthlyData[sortKey].fieldsDetail[fieldName] = {
          count: 0,
          revenue: 0
        };
      }
      monthlyData[sortKey].fieldsDetail[fieldName].count += 1;
      monthlyData[sortKey].fieldsDetail[fieldName].revenue += price;
    });

    // Sort chronologically and map
    return Object.keys(monthlyData)
      .sort()
      .map((key) => ({
        month: monthlyData[key].display,
        revenue: monthlyData[key].revenue,
        count: monthlyData[key].count,
        fieldsList: Object.keys(monthlyData[key].fieldsDetail).map((fName) => ({
          name: fName,
          count: monthlyData[key].fieldsDetail[fName].count,
          revenue: monthlyData[key].fieldsDetail[fName].revenue
        }))
      }));
  };

  // Calculate revenue breakdown by Owner
  const getRevenueByOwner = () => {
    const ownerData = {};

    // Get all users who are owners (role 1)
    const owners = users.filter((u) => u.role === "1");

    owners.forEach((owner) => {
      // Find all fields belonging to this owner
      const ownerFields = fields.filter((f) => String(f.ownerId) === String(owner.id));
      const ownerFieldIds = ownerFields.map((f) => String(f.id));

      // Find all bookings for these fields
      const ownerBookings = bookings.filter((b) => ownerFieldIds.includes(String(b.fieldId)));

      // Calculate total revenue
      let totalRevenue = 0;
      ownerBookings.forEach((b) => {
        const field = ownerFields.find((f) => String(f.id) === String(b.fieldId));
        totalRevenue += field ? field.price : 0;
      });

      ownerData[owner.id] = {
        fullName: owner.fullName,
        username: owner.username,
        fieldsCount: ownerFields.length,
        bookingsCount: ownerBookings.length,
        revenue: totalRevenue
      };
    });

    return Object.values(ownerData);
  };

  const totalAdminRevenue = getAdminRevenueData().reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Container className="py-4">
      <h2 className="text-primary fw-bold mb-4">
        Hệ Thống Quản Trị
      </h2>

      <Tabs defaultActiveKey="users" className="mb-4">
        {/* ================= USERS ================= */}
        <Tab eventKey="users" title="Người dùng">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0 fw-semibold text-secondary">Danh sách tài khoản</h5>
            {!showUserForm && (
              <Button onClick={() => setShowUserForm(true)} size="sm">
                + Thêm tài khoản mới
              </Button>
            )}
          </div>

          {showUserForm && (
            <Card className="mb-3 border-0 shadow-sm bg-light">
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
                    <Form.Control
                      type="password"
                      placeholder="Mật khẩu"
                      value={userForm.password || ""}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          password: e.target.value,
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

                  <Col md={1}>
                    <Button onClick={handleSaveUser} className="w-100">
                      Lưu
                    </Button>
                  </Col>

                  <Col md={1}>
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

          <Table bordered hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Tên người dùng</th>
                <th>Username</th>
                <th>Vai trò</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.fullName}</strong></td>
                  <td>{u.username}</td>
                  <td>
                    {u.role === "0" && <span className="badge bg-danger">Admin</span>}
                    {u.role === "1" && <span className="badge bg-success">Chủ sân</span>}
                    {u.role === "2" && <span className="badge bg-secondary">Khách đặt</span>}
                  </td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => {
                        setUserForm(u);
                        setShowUserForm(true);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0 fw-semibold text-secondary">Danh sách sân hoạt động</h5>
            {!showFieldForm && (
              <Button onClick={() => setShowFieldForm(true)} size="sm">
                + Thêm sân bóng mới
              </Button>
            )}
          </div>

          {showFieldForm && (
            <Card className="mb-3 border-0 shadow-sm bg-light">
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
                      placeholder="Giá thuê"
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
                    <Button onClick={handleSaveField} className="w-100">Lưu</Button>
                  </Col>

                  <Col md={1}>
                    <Button
                      variant="secondary"
                      className="w-100"
                      onClick={() => setShowFieldForm(false)}
                    >
                      Hủy
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Table bordered hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Tên sân bóng</th>
                <th>Địa điểm</th>
                <th>Giá thuê</th>
                <th>Chủ sân (ID)</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => {
                const ownerUser = users.find(u => String(u.id) === String(f.ownerId));
                return (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td><strong>{f.fieldName}</strong></td>
                    <td>{f.location}</td>
                    <td>{f.price.toLocaleString("vi-VN")} đ</td>
                    <td>{ownerUser ? `${ownerUser.fullName} (${f.ownerId})` : f.ownerId}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => {
                          setFieldForm(f);
                          setShowFieldForm(true);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deleteField(f.id)}
                      >
                        Xoá
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Tab>

        {/* ================= REVENUE STATISTICS ================= */}
        <Tab eventKey="revenue" title="Báo cáo doanh thu">
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
                <Card.Body className="p-4">
                  <h6 className="text-uppercase mb-2 opacity-75">Tổng doanh thu hệ thống</h6>
                  <h2 className="fw-bold m-0">{totalAdminRevenue.toLocaleString("vi-VN")} đ</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm text-white bg-success">
                <Card.Body className="p-4">
                  <h6 className="text-uppercase mb-2 opacity-75">Tổng số lượt đặt sân</h6>
                  <h2 className="fw-bold m-0">{bookings.length} lượt</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm text-white bg-warning">
                <Card.Body className="p-4">
                  <h6 className="text-uppercase mb-2 opacity-75">Tổng số sân hoạt động</h6>
                  <h2 className="fw-bold m-0">{fields.length} sân</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3">
              <h5 className="m-0 fw-semibold text-secondary">Doanh thu theo các tháng</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered hover responsive className="m-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Tháng / Năm</th>
                    <th>Chi tiết các sân được đặt</th>
                    <th className="text-center">Số lượt đặt sân</th>
                    <th className="text-end pe-3">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {getAdminRevenueData().length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">Chưa có dữ liệu doanh thu</td>
                    </tr>
                  ) : (
                    getAdminRevenueData().map((item, idx) => (
                      <tr key={idx}>
                        <td className="ps-3"><strong>Tháng {item.month}</strong></td>
                        <td>
                          <ul className="mb-0 ps-3 small text-secondary">
                            {item.fieldsList.map((f, fIdx) => (
                              <li key={fIdx}>
                                <strong>{f.name}</strong>: {f.count} lượt đặt ({f.revenue.toLocaleString("vi-VN")} đ)
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="text-center">{item.count} lượt đặt</td>
                        <td className="text-end pe-3 fw-bold text-success">
                          {item.revenue.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h5 className="m-0 fw-semibold text-secondary">Doanh thu theo từng Chủ sân</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered hover responsive className="m-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Tên Chủ sân</th>
                    <th>Tài khoản</th>
                    <th className="text-center">Số sân sở hữu</th>
                    <th className="text-center">Tổng số lượt đặt</th>
                    <th className="text-end pe-3">Doanh thu tích lũy</th>
                  </tr>
                </thead>
                <tbody>
                  {getRevenueByOwner().length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">Chưa có dữ liệu chủ sân</td>
                    </tr>
                  ) : (
                    getRevenueByOwner().map((item, idx) => (
                      <tr key={idx}>
                        <td className="ps-3"><strong>{item.fullName}</strong></td>
                        <td><code>{item.username}</code></td>
                        <td className="text-center">{item.fieldsCount} sân</td>
                        <td className="text-center">{item.bookingsCount} lượt đặt</td>
                        <td className="text-end pe-3 fw-bold text-primary">
                          {item.revenue.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Admin;