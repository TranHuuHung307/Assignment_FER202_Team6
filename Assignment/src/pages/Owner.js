import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import agent from '../api/agent';

const Owner = () => {
  const [myFields, setMyFields] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [fieldForm, setFieldForm] = useState({ id: null, fieldName: '', location: '', price: 0 });
  const [showModal, setShowModal] = useState(false);

  const owner = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    const [f, b] = await Promise.all([agent.Fields.list(), agent.Bookings.list()]);
    const filteredFields = f.data.filter(field => String(field.ownerId) === String(owner.id));
    setMyFields(filteredFields);
    setAllBookings(b.data);
  };

  const handleSaveField = async () => {
    const data = { ...fieldForm, ownerId: owner.id, price: parseInt(fieldForm.price) };
    if (fieldForm.id) {
      await agent.Fields.update(fieldForm.id, data);
    } else {
      await agent.Fields.create({ ...data, id: Date.now() });
    }
    setFieldForm({ id: null, fieldName: '', location: '', price: 0 });
    setShowModal(false);
    loadOwnerData();
  };

  const getMyFieldBookings = () => {
    const fieldIds = myFields.map(f => String(f.id));
    return allBookings.filter(booking => fieldIds.includes(String(booking.fieldId)));
  };

  // ================= REVENUE STATISTICS FOR OWNER =================
  const getOwnerRevenueData = () => {
    const monthlyData = {};
    const myBookings = getMyFieldBookings();

    myBookings.forEach((b) => {
      const field = myFields.find((f) => String(f.id) === String(b.fieldId));
      const price = field ? field.price : 0;
      const fieldName = field ? field.fieldName : "Sân không xác định";
      
      if (!b.timeSlot) return;
      const datePart = b.timeSlot.split(" ")[0];
      const parts = datePart.split("-");
      if (parts.length < 2) return;
      
      const year = parts[0];
      const month = parts[1];
      const sortKey = `${year}-${month}`;
      const displayKey = `${month}/${year}`;

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

  const totalOwnerRevenue = getOwnerRevenueData().reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold">Quản lý Sân bóng của tôi</h2>
        <Button variant="success" className="fw-bold px-3 py-2" onClick={() => setShowModal(true)}>+ Thêm sân mới</Button>
      </div>

      <Row>
        {/* DANH SÁCH SÂN */}
        <Col lg={7}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white font-weight-bold py-3 text-secondary">Danh sách sân hoạt động</Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="m-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-3">Tên sân / Địa chỉ</th>
                    <th>Giá thuê</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {myFields.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">Chưa có sân bóng nào. Hãy thêm sân mới!</td>
                    </tr>
                  ) : (
                    myFields.map(f => (
                      <tr key={f.id}>
                        <td className="ps-3">
                          <strong>{f.fieldName}</strong><br/>
                          <small className="text-muted">{f.location}</small>
                        </td>
                        <td>{f.price.toLocaleString("vi-VN")} đ</td>
                        <td className="text-center">
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setFieldForm(f); setShowModal(true); }}>Sửa</Button>
                          <Button variant="outline-danger" size="sm" onClick={async () => { if(window.confirm("Xoá?")) { await agent.Fields.delete(f.id); loadOwnerData(); } }}>Xoá</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* LỊCH ĐẶT MỚI NHẤT */}
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3 text-secondary font-weight-bold">Lịch đặt gần đây</Card.Header>
            <Card.Body style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {getMyFieldBookings().length === 0 ? (
                <div className="text-center py-4 text-muted">Chưa có lượt đặt sân nào</div>
              ) : (
                getMyFieldBookings().map(b => (
                  <div key={b.id} className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                    <div>
                      <h6 className="mb-0 fw-semibold">{myFields.find(f => String(f.id) === String(b.fieldId))?.fieldName}</h6>
                      <small className="text-primary">{b.timeSlot}</small>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={async () => { if(window.confirm("Huỷ đặt sân này?")) { await agent.Bookings.delete(b.id); loadOwnerData(); } }}>Huỷ</Button>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* THÔNG KÊ DOANH THU */}
      <Row className="mt-4">
        <Col lg={4} className="mb-3">
          <Card className="border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }}>
            <Card.Body className="p-4">
              <h6 className="text-uppercase mb-2 opacity-75 fw-semibold">Tổng doanh thu nhận được</h6>
              <h2 className="fw-bold m-0">{totalOwnerRevenue.toLocaleString("vi-VN")} đ</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3 text-secondary font-weight-bold">Thống kê doanh thu theo các tháng</Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="m-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Tháng / Năm</th>
                    <th>Chi tiết các sân được đặt</th>
                    <th className="text-center">Số lượt thuê sân</th>
                    <th className="text-end pe-3">Doanh thu tháng</th>
                  </tr>
                </thead>
                <tbody>
                  {getOwnerRevenueData().length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">Chưa có dữ liệu doanh thu</td>
                    </tr>
                  ) : (
                    getOwnerRevenueData().map((item, idx) => (
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
                        <td className="text-center">{item.count} lượt thuê</td>
                        <td className="text-end pe-3 text-success fw-bold">{item.revenue.toLocaleString("vi-VN")} đ</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL THÊM/SỬA SÂN */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{fieldForm.id ? "Cập nhật sân" : "Tạo sân mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên sân bóng</Form.Label>
              <Form.Control value={fieldForm.fieldName} onChange={e => setFieldForm({...fieldForm, fieldName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Control value={fieldForm.location} onChange={e => setFieldForm({...fieldForm, location: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá thuê (VNĐ)</Form.Label>
              <Form.Control type="number" value={fieldForm.price} onChange={e => setFieldForm({...fieldForm, price: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button variant="success" onClick={handleSaveField}>Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Owner;