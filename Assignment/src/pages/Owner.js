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
    const filteredFields = f.data.filter(field => field.ownerId === owner.id);
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
    const fieldIds = myFields.map(f => f.id);
    return allBookings.filter(booking => fieldIds.includes(booking.fieldId));
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark">Quản lý Sân bóng của tôi</h2>
        <Button variant="success" onClick={() => setShowModal(true)}>+ Thêm sân mới</Button>
      </div>

      <Row>
        {/* DANH SÁCH SÂN */}
        <Col lg={7}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white font-weight-bold">Danh sách sân hoạt động</Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Tên sân</th>
                    <th>Giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {myFields.map(f => (
                    <tr key={f.id}>
                      <td><strong>{f.fieldName}</strong><br/><small className="text-muted">{f.location}</small></td>
                      <td>{f.price.toLocaleString()}đ</td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => { setFieldForm(f); setShowModal(true); }}>Sửa</Button>
                        <Button variant="outline-danger" size="sm" className="text-danger" onClick={async () => { if(window.confirm("Xoá?")) { await agent.Fields.delete(f.id); loadOwnerData(); } }}>Xoá</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* LỊCH ĐẶT MỚI NHẤT */}
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">Lịch đặt gần đây</Card.Header>
            <Card.Body>
              {getMyFieldBookings().map(b => (
                <div key={b.id} className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                  <div>
                    <h6 className="mb-0">{myFields.find(f => f.id === b.fieldId)?.fieldName}</h6>
                    <small className="text-primary">{b.timeSlot}</small>
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={async () => { if(window.confirm("Huỷ?")) { await agent.Bookings.delete(b.id); loadOwnerData(); } }}>Huỷ</Button>
                </div>
              ))}
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