import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col,Card} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { updateProfile, getProfile } from '../services/api';
import { setUserInfo } from '../store/userSlice';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
      setAddress(userInfo.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      });
    }
  }, [userInfo]);

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        name,
        email,
        phone,
        address,
      };

      if (password) {
        updateData.password = password;
      }

      const data = await updateProfile(updateData);
      dispatch(setUserInfo(data));
      toast.success('Profile updated successfully');
      
      // Clear password fields
      setPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Smart Hardware Store</title>
      </Helmet>

<Row className="mt-4">
  {/* Profile Form */}
  <Col lg={userInfo?.isAdmin ? 12 : 4}>
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title className="mb-4 text-center">My Profile</Card.Title>

        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader />}

        <Form onSubmit={submitHandler}>
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} disabled />
          </Form.Group>

          {/* Phone */}
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>

          {/* Password */}
          <hr />
          <h6 className="mb-3">Change Password</h6>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          {/* Address */}
          <hr />
          <h6 className="mb-3">Address</h6>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="street"
              placeholder="Street Address"
              value={address.street}
              onChange={handleAddressChange}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleAddressChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleAddressChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={address.zipCode}
                  onChange={handleAddressChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={address.country}
                  onChange={handleAddressChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" className="w-100" variant="primary" disabled={loading}>
            Update Profile
          </Button>
        </Form>
      </Card.Body>
    </Card>
  </Col>

  {/* My Orders Section (only for users) */}
  {!userInfo?.isAdmin && (
    <Col lg={8}>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-4 text-center">My Orders</Card.Title>
          <p className="text-muted text-center">Your order history will appear here.</p>
        </Card.Body>
      </Card>
    </Col>
  )}
</Row>
    </>
  );
};

export default ProfilePage;