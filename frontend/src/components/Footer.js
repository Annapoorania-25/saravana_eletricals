import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4 py-md-5">
      <Container>
        <Row className="g-3 g-md-4">
          <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0">
            <h5 className="mb-3 fs-6 fs-md-5">🏪 Smart Hardware Store</h5>
            <p className="text-secondary small">
              Your one-stop shop for all hardware needs with AI recommendations 
              and AR visualization. Quality tools and equipment for every project.
            </p>
            <div className="mt-3 d-flex gap-2 flex-wrap">
              <a href="#" className="text-light" style={{ fontSize: '18px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaFacebook /></a>
              <a href="#" className="text-light" style={{ fontSize: '18px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTwitter /></a>
              <a href="#" className="text-light" style={{ fontSize: '18px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaInstagram /></a>
              <a href="#" className="text-light" style={{ fontSize: '18px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaLinkedin /></a>
            </div>
          </Col>
          
          <Col xs={12} sm={6} md={2} className="mb-3 mb-md-0">
            <h5 className="mb-3 fs-6 fs-md-5">Quick Links</h5>
            <ul className="list-unstyled gap-2 d-flex flex-column">
              <li className="mb-1">
                <Link to="/" className="text-secondary text-decoration-none small">🏠 Home</Link>
              </li>
              <li className="mb-1">
                <Link to="/products" className="text-secondary text-decoration-none small">📦 Products</Link>
              </li>
              <li className="mb-1">
                <Link to="/cart" className="text-secondary text-decoration-none small">🛒 Cart</Link>
              </li>
              <li className="mb-1">
                <Link to="/login" className="text-secondary text-decoration-none small">🔑 Login</Link>
              </li>
              <li className="mb-1">
                <Link to="/register" className="text-secondary text-decoration-none small">📝 Register</Link>
              </li>
            </ul>
          </Col>
          
          <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
            <h5 className="mb-3 fs-6 fs-md-5">Categories</h5>
            <ul className="list-unstyled gap-2 d-flex flex-column">
              <li className="mb-1">
                <Link to="/products?category=Tools" className="text-secondary text-decoration-none small">🔧 Tools</Link>
              </li>
              <li className="mb-1">
                <Link to="/products?category=Electrical" className="text-secondary text-decoration-none small">⚡ Electrical</Link>
              </li>
              <li className="mb-1">
                <Link to="/products?category=Plumbing" className="text-secondary text-decoration-none small">💧 Plumbing</Link>
              </li>
              <li className="mb-1">
                <Link to="/products?category=Paint" className="text-secondary text-decoration-none small">🎨 Paint</Link>
              </li>
              <li className="mb-1">
                <Link to="/products?category=Hardware" className="text-secondary text-decoration-none small">🔩 Hardware</Link>
              </li>
              <li className="mb-1">
                <Link to="/products?category=Garden" className="text-secondary text-decoration-none small">🌱 Garden</Link>
              </li>
            </ul>
          </Col>
          
          <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
            <h5 className="mb-3 fs-6 fs-md-5">Contact Us</h5>
            <ul className="list-unstyled gap-2 d-flex flex-column">
              <li className="mb-1 text-secondary small">
                <FaEnvelope className="me-2" /> support@hardwarestore.com
              </li>
              <li className="mb-1 text-secondary small">
                <FaPhone className="me-2" /> +1 (555) 123-4567
              </li>
              <li className="mb-1 text-secondary small">
                <FaMapMarkerAlt className="me-2" /> 123 Hardware St, City, State
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="bg-secondary" />
        
        <Row>
          <Col className="text-center">
            <p className="text-secondary mb-0">
              &copy; {new Date().getFullYear()} Smart Hardware Store. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;