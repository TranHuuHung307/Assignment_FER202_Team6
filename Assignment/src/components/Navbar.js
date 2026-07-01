import { Navbar, Container, Button, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#">MiniFootball Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link disabled>Chào, {user.fullName}</Nav.Link>
          </Nav>
          <Button variant="outline-light" size="sm" onClick={logout}>Đăng xuất</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;