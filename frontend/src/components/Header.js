import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Nav, Container, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch, FaHome, FaBox, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { logout } from '../store/userSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  const [searchKeyword, setSearchKeyword] = React.useState('');

  const submitSearchHandler = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?keyword=${searchKeyword}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
            🏪 Smart Hardware Store
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Search Bar - Responsive */}
            <Form className="d-flex mx-auto flex-fill flex-lg-grow-1" style={{ width: '100%', maxWidth: '400px', margin: '0.5rem auto' }} onSubmit={submitSearchHandler}>
              <FormControl
                type="search"
                placeholder="Search products..."
                className="me-2 rounded-pill"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', padding: 'clamp(0.4rem, 1vw, 0.6rem)' }}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button type="submit" variant="outline-light" className="rounded-pill" style={{ minWidth: '44px' }}>
                <FaSearch />
              </Button>
            </Form>

            <Nav className="ms-auto d-flex flex-column flex-lg-row align-items-start align-lg-items-center gap-1 gap-lg-0">
              {/* Home Link */}
              <Nav.Link as={Link} to="/" className="mx-lg-2" style={{ padding: '0.25rem 0.5rem' }}>
                <FaHome /> Home
              </Nav.Link>

              {/* Products Link */}
              <Nav.Link as={Link} to="/products" className="mx-lg-2" style={{ padding: '0.25rem 0.5rem' }}>
                <FaBox /> Products
              </Nav.Link>

              {/* Cart Link */}
              <Nav.Link as={Link} to="/cart" className="mx-lg-2 position-relative" style={{ padding: '0.25rem 0.5rem' }}>
                <FaShoppingCart /> Cart
                {cartItems?.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartItems.length}
                  </span>
                )}
              </Nav.Link>

              {/* User Menu */}
              {userInfo ? (
                <NavDropdown 
                  title={
                    <span>
                      <FaUser /> {userInfo?.name ? userInfo.name.split(' ')[0] : 'User'}
                    </span>
                  } 
                  id="username"
                  className="mx-lg-2"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    👤 My Profile
                  </NavDropdown.Item>
                  {userInfo.role !== 'admin' && (
                    <NavDropdown.Item as={Link} to="/orders">
                      📦 My Orders
                    </NavDropdown.Item>
                  )}
                  {userInfo.role === 'admin' && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/admin">
                        ⚙️ Admin Dashboard
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/products">
                        📋 Manage Products
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/orders">
                        🧾 View Orders
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    🚪 Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="mx-lg-2" style={{ padding: '0.25rem 0.5rem' }}>
                    <FaSignInAlt /> Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="mx-lg-2" style={{ padding: '0.25rem 0.5rem' }}>
                    <FaUserPlus /> Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Secondary Navigation Bar (hidden for admin) */}
      {userInfo?.role !== 'admin' && (
        <Navbar bg="light" variant="light" className="py-2 shadow-sm overflow-auto hide-scrollbar" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <Container fluid>
            <Nav className="w-100 d-flex justify-content-start overflow-auto hide-scrollbar" style={{ 
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              <Nav.Link as={Link} to="/products?category=Tools" className="text-dark flex-shrink-0" style={{ padding: '0.25rem 0.75rem' }}>
                🔧 Tools
              </Nav.Link>
              <Nav.Link as={Link} to="/products?category=Electrical" className="text-dark flex-shrink-0" style={{ padding: '0.25rem 0.75rem' }}>
                ⚡ Electrical
              </Nav.Link>
              <Nav.Link as={Link} to="/products?category=Plumbing" className="text-dark flex-shrink-0" style={{ padding: '0.25rem 0.75rem' }}>
                💧 Plumbing
              </Nav.Link>
              <Nav.Link as={Link} to="/products?category=Paint" className="text-dark flex-shrink-0" style={{ padding: '0.25rem 0.75rem' }}>
                🎨 Paint
              </Nav.Link>
              <Nav.Link as={Link} to="/products?category=Hardware" className="text-dark flex-shrink-0" style={{ padding: '0.25rem 0.75rem' }}>
                🔩 Hardware
              </Nav.Link>
              <Nav.Link as={Link} to="/products?category=Garden" className="text-dark mx-3">
                🌱 Garden
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      )}
    </header>
  );
};

export default Header;