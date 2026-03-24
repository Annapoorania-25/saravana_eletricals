import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Container, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaFacebook, FaTwitter, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/Loader';
import Message from '../components/Message';
import authService from '../services/authService';
import { setUserInfo, setLoading, setError } from '../store/userSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { userInfo, loading, error } = useSelector((state) => state.user);
  
  const query = new URLSearchParams(location.search);
  const redirect = query.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      dispatch(setLoading(true));
      const data = await authService.login(email, password);
      dispatch(setUserInfo(data));
      dispatch(setLoading(false));
      toast.success(`Welcome back, ${data.name}!`);
      navigate(redirect);
    } catch (err) {
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Invalid email or password'));
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Smart Hardware Store</title>
      </Helmet>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold">Welcome Back! 👋</h1>
              <p className="text-secondary">Sign in to continue to Smart Hardware Store</p>
            </div>

            {/* Main Card */}
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                {/* Error Message */}
                {error && (
                  <Alert variant="danger" className="rounded-3 mb-4">
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={submitHandler}>
                  {/* Email Field */}
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="py-3 ps-5 rounded-3 border-2"
                        style={{ borderColor: '#e9ecef' }}
                        required
                      />
                      <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    </div>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="py-3 ps-5 rounded-3 border-2"
                        style={{ borderColor: '#e9ecef' }}
                        required
                      />
                      <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y text-decoration-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Remember Me & Forgot Password */}
                  <Row className="mb-4">
                    <Col>
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        className="text-secondary"
                      />
                    </Col>
                    <Col className="text-end">
                      <Link to="/forgot-password" className="text-decoration-none text-primary">
                        Forgot Password?
                      </Link>
                    </Col>
                  </Row>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-3 mb-4 rounded-3 fw-bold"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader size="sm" /> Signing in...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" /> Sign In
                      </>
                    )}
                  </Button>

                  {/* Social Login */}
                  <div className="position-relative mb-4">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary">
                      OR
                    </span>
                  </div>

                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-danger" className="rounded-circle p-3" style={{ width: '50px', height: '50px' }}>
                      <FaGoogle />
                    </Button>
                    <Button variant="outline-primary" className="rounded-circle p-3" style={{ width: '50px', height: '50px' }}>
                      <FaFacebook />
                    </Button>
                    <Button variant="outline-info" className="rounded-circle p-3" style={{ width: '50px', height: '50px' }}>
                      <FaTwitter />
                    </Button>
                  </div>
                </Form>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <p className="text-secondary mb-0">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-primary fw-bold text-decoration-none"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>

                {/* Guest Login */}
                <div className="text-center mt-3">
                  <Button
                    as={Link}
                    to="/products"
                    variant="link"
                    className="text-decoration-none text-secondary"
                  >
                    Continue as Guest →
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Features */}
            <Row className="mt-4 g-3">
              <Col xs={4}>
                <div className="text-center">
                  <div className="bg-light rounded-circle p-3 mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                    <FaShieldAlt className="text-primary" size={24} />
                  </div>
                  <small className="text-secondary d-block">Secure Login</small>
                </div>
              </Col>
              <Col xs={4}>
                <div className="text-center">
                  <div className="bg-light rounded-circle p-3 mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                    <FaHeadset className="text-primary" size={24} />
                  </div>
                  <small className="text-secondary d-block">24/7 Support</small>
                </div>
              </Col>
              <Col xs={4}>
                <div className="text-center">
                  <div className="bg-light rounded-circle p-3 mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                    <FaShieldAlt className="text-primary" size={24} />
                  </div>
                  <small className="text-secondary d-block">Data Privacy</small>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LoginPage;