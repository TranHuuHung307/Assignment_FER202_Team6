import { useEffect, useState, useCallback } from "react";
import agent from "../api/agent";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Alert,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";

const User = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [show, setShow] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
  });

  const [error, setError] = useState(false);

  // EDIT
  const [showEdit, setShowEdit] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const loadData = useCallback(async () => {
    const [f, b] = await Promise.all([
      agent.Fields.list(),
      agent.Bookings.list(),
    ]);

    setFields(f.data);
    setBookings(b.data);

    if (user) {
      const userBookings = b.data
        .filter((bk) => bk.userId === user.id)
        .map((bk) => {
          const field = f.data.find((x) => x.id === bk.fieldId);
          return {
            ...bk,
            fieldName: field?.fieldName || "N/A",
          };
        });

      setMyBookings(userBookings);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== BOOK =====
  const handleShow = (field) => {
    if (!user) {
      alert("Đăng nhập đi bro ");
      return;
    }
    setSelectedField(field);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setError(false);
    setBookingForm({ date: "", time: "" });
  };

  const handleConfirmBooking = async () => {
    const { date, time } = bookingForm;

    if (!date || !time) {
      setError(true);
      return;
    }

    const timeSlot = `${date} ${time}`;

    const isConflict = bookings.some(
      (b) => b.fieldId === selectedField.id && b.timeSlot === timeSlot,
    );

    if (isConflict) {
      alert("Trùng lịch ");
      return;
    }

    await agent.Bookings.create({
      userId: user.id,
      fieldId: selectedField.id,
      timeSlot,
    });

    alert("Đặt thành công ");
    handleClose();
    loadData();
  };

  // ===== DELETE =====
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thật không?")) return;

    await agent.Bookings.delete(id);
    alert("Đã xóa");
    loadData();
  };

  // ===== EDIT =====
  const handleShowEdit = (bk) => {
    const [date, time] = bk.timeSlot.split(" ");
    setEditingBooking({ ...bk, date, time });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    const { id, fieldId, date, time } = editingBooking;

    const timeSlot = `${date} ${time}`;

    const isConflict = bookings.some(
      (b) => b.fieldId === fieldId && b.timeSlot === timeSlot && b.id !== id,
    );

    if (isConflict) {
      alert("Trùng lịch rồi ");
      return;
    }

    await agent.Bookings.update(id, {
      ...editingBooking,
      timeSlot,
    });

    alert("Update thành công");
    setShowEdit(false);
    loadData();
  };

  // ===== FILTER =====
  const locations = Array.from(new Set(fields.map((f) => f.location)));

  const filteredFields = fields.filter((f) => {
    return (
      f.fieldName.toLowerCase().includes(search.toLowerCase()) &&
      (location === "" || f.location === location)
    );
  });

  return (
    <Container className="mt-3">
      <h2>Football Booking</h2>

      <Tabs defaultActiveKey="fields" className="mb-3">
        {/* ===== TAB 1: FIELDS ===== */}
        <Tab eventKey="fields" title="Danh sách sân">
          {/* Filter */}
          <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
            <Form.Control
              style={{ width: "20%" }}
              placeholder="Search field..."
              onChange={(e) => setSearch(e.target.value)}
            />

            <Form.Select
              style={{ width: "20%" }}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((l, i) => (
                <option key={i} value={l}>
                  {l}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Card UI */}
          <Container fluid className="px-0">
            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
              {filteredFields.map((f) => (
                <Col key={f.id}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Img
                      variant="top"
                      src="/anh-san-bong.jpg"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{f.fieldName}</Card.Title>

                      <Card.Text className="text-muted small flex-grow-1">
                        📍 {f.location}
                      </Card.Text>

                      <h6 className="text-danger">
                        {f.price.toLocaleString()}đ
                      </h6>

                      <Button
                        variant="primary"
                        className="w-100 mt-auto"
                        onClick={() => handleShow(f)}
                      >
                        Book Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </Tab>

        {/* ===== TAB 2: MY BOOKINGS ===== */}
        <Tab eventKey="bookings" title="Lịch sử của tôi">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Sân</th>
                <th>Thời gian</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.fieldName}</td>
                  <td>{b.timeSlot}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleShowEdit(b)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* Modal Book*/}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Book: {selectedField?.fieldName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">Bạn phải nhập đủ các mục</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control value={user?.fullName || ""} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={bookingForm.date}
                onChange={(e) => {
                  setBookingForm({
                    ...bookingForm,
                    date: e.target.value,
                  });
                  setError(false);
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={bookingForm.time}
                onChange={(e) => {
                  setBookingForm({
                    ...bookingForm,
                    time: e.target.value,
                  });
                  setError(false);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmBooking}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== MODAL EDIT ===== */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="date"
              value={editingBooking?.date || ""}
              onChange={(e) =>
                setEditingBooking({
                  ...editingBooking,
                  date: e.target.value,
                })
              }
            />
            <Form.Control
              type="time"
              className="mt-2"
              value={editingBooking?.time || ""}
              onChange={(e) =>
                setEditingBooking({
                  ...editingBooking,
                  time: e.target.value,
                })
              }
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default User;
