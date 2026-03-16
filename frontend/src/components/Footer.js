import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="mb-3">🏪 Smart Hardware Store</h5>
            <p className="text-secondary">
              Your one-stop shop for all hardware needs with AI recommendations 
              and AR visualization. Quality tools and equipment for every project.
            </p>
            <div className="mt-3">
              <a href="#" className="text-light me-3"><FaFacebook size={20} /></a>
              <a href="#" className="text-light me-3"><FaTwitter size={20} /></a>
              <a href="#" className="text-light me-3"><FaInstagram size={20} /></a>
              <a href="#" className="text-light"><FaLinkedin size={20} /></a>
            </div>
          </Col>
          
          <Col md={2} className="mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-secondary text-decoration-none">🏠 Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-secondary text-decoration-none">📦 Products</Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-secondary text-decoration-none">🛒 Cart</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-secondary text-decoration-none">🔑 Login</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-secondary text-decoration-none">📝 Register</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4">
            <h5 className="mb-3">Categories</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products?category=Tools" className="text-secondary text-decoration-none">🔧 Tools</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Electrical" className="text-secondary text-decoration-none">⚡ Electrical</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Plumbing" className="text-secondary text-decoration-none">💧 Plumbing</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Paint" className="text-secondary text-decoration-none">🎨 Paint</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Hardware" className="text-secondary text-decoration-none">🔩 Hardware</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Garden" className="text-secondary text-decoration-none">🌱 Garden</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4">
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-secondary">
                <FaEnvelope className="me-2" /> support@hardwarestore.com
              </li>
              <li className="mb-2 text-secondary">
                <FaPhone className="me-2" /> +1 (555) 123-4567
              </li>
              <li className="mb-2 text-secondary">
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