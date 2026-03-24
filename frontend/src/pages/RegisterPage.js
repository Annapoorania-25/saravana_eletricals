import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Container, Alert, InputGroup, ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaUserPlus } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { register } from '../services/api';
import { setUserInfo, setLoading, setError } from '../store/userSlice';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo, loading, error } = useSelector((state) => state.user);

  // Clear previous errors when register page loads
  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  useEffect(() => {
    // Redirect to home/admin only if user is already logged in AND not in register flow
    if (userInfo && !isRegistering) {
      if (userInfo.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [userInfo, navigate, isRegistering]);

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[!@#$%^&*]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['danger', 'warning', 'info', 'primary', 'success'];

  // Validate individual fields
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validatePhone = (phoneValue) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneValue.replace(/\D/g, ''));
  };

  const updateFieldError = (field, isValid) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: !isValid && prev[field] ? true : false
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    const errors = {};

    // Validate all fields
    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (phone && !validatePhone(phone)) {
      errors.phone = 'Phone must be 10 digits';
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsRegistering(true);
      dispatch(setLoading(true));
      await register({ name, email, password, phone });
      dispatch(setLoading(false));
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || err.message));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - Smart Hardware Store</title>
      </Helmet>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold">Join Us! 🎉</h1>
              <p className="text-secondary">Create your account to get started with the Smart Hardware Store</p>
            </div>

            {/* Main Card */}
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                {/* Error Message */}
                {error && (
                  <Alert variant="danger" className="rounded-3 mb-4 d-flex align-items-center">
                    <FaTimesCircle className="me-3" /> {error}
                  </Alert>
                )}

                {/* Registration Form */}
                <Form onSubmit={submitHandler}>
                  {/* Full Name */}
                  <Form.Group className="mb-4" controlId="name">
                    <Form.Label className="fw-semibold">Full Name *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-2">
                        <FaUser className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (e.target.value.trim()) {
                            updateFieldError('name', true);
                          }
                        }}
                        isInvalid={fieldErrors.name}
                        className="py-3 border-2"
                        required
                      />
                      {name.trim() && <FaCheckCircle className="position-absolute end-3 top-50 translate-middle-y text-success" />}
                    </InputGroup>
                    {fieldErrors.name && <small className="text-danger d-block mt-2">{fieldErrors.name}</small>}
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label className="fw-semibold">Email Address *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-2">
                        <FaEnvelope className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          updateFieldError('email', validateEmail(e.target.value));
                        }}
                        isInvalid={fieldErrors.email}
                        className="py-3 border-2"
                        required
                      />
                      {email && validateEmail(email) && <FaCheckCircle className="position-absolute end-3 top-50 translate-middle-y text-success" />}
                    </InputGroup>
                    {fieldErrors.email && <small className="text-danger d-block mt-2">{fieldErrors.email}</small>}
                  </Form.Group>

                  {/* Phone Number */}
                  <Form.Group className="mb-4" controlId="phone">
                    <Form.Label className="fw-semibold">Phone Number (Optional)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-2">
                        <FaPhone className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        placeholder="10 digit phone number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (e.target.value) {
                            updateFieldError('phone', validatePhone(e.target.value));
                          }
                        }}
                        isInvalid={fieldErrors.phone}
                        className="py-3 border-2"
                      />
                      {phone && validatePhone(phone) && <FaCheckCircle className="position-absolute end-3 top-50 translate-middle-y text-success" />}
                    </InputGroup>
                    {fieldErrors.phone && <small className="text-danger d-block mt-2">{fieldErrors.phone}</small>}
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <FaLock className="me-2 text-primary" /> Password *
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={fieldErrors.password}
                        className="py-3 border-2"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="border-2"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="fw-semibold">Password Strength:</small>
                          <small className={`fw-bold text-${strengthColors[passwordStrength - 1]}`}>
                            {strengthLabels[passwordStrength - 1]}
                          </small>
                        </div>
                        <ProgressBar 
                          now={(passwordStrength / 5) * 100} 
                          variant={strengthColors[passwordStrength - 1]}
                          className="rounded-pill"
                          style={{ height: '8px' }}
                        />
                      </div>
                    )}
                    {fieldErrors.password && <small className="text-danger d-block mt-2">{fieldErrors.password}</small>}
                  </Form.Group>

                  {/* Confirm Password */}
                  <Form.Group className="mb-4" controlId="confirmPassword">
                    <Form.Label className="fw-semibold">Confirm Password *</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (password === e.target.value && e.target.value) {
                            updateFieldError('confirmPassword', true);
                          }
                        }}
                        isInvalid={fieldErrors.confirmPassword}
                        className="py-3 border-2"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="border-2"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                      {password && confirmPassword === password && <FaCheckCircle className="position-absolute end-12 top-50 translate-middle-y text-success" style={{ right: '50px' }} />}
                    </InputGroup>
                    {fieldErrors.confirmPassword && <small className="text-danger d-block mt-2">{fieldErrors.confirmPassword}</small>}
                  </Form.Group>

                  {/* Terms & Conditions */}
                  <Form.Group className="mb-4">
                    <Form.Check 
                      type="checkbox"
                      id="terms"
                      label={
                        <span className="text-muted">
                          I agree to the <Link to="/terms" className="text-primary fw-semibold">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary fw-semibold">Privacy Policy</Link> *
                        </span>
                      }
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="form-check"
                    />
                  </Form.Group>

                  {/* Register Button */}
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || isRegistering || !agreeToTerms}
                    className="w-100 py-3 fw-bold rounded-3 mb-3"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="me-2" /> Create Account
                      </>
                    )}
                  </Button>

                  {/* Loader */}
                  {loading && <Loader />}
                </Form>

                {/* Login Link */}
                <div className="text-center pt-3 border-top">
                  <p className="text-muted mb-0">
                    Already have an account? <Link to="/login" className="text-primary fw-semibold">Login here</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Security Info */}
            <div className="mt-4 text-center text-muted small">
              <FaShieldAlt className="me-2" />
              Your information is secure and encrypted
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RegisterPage;