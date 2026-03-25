import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaShoppingCart, FaChartLine, FaArrowUp, FaClipboardList, FaCog } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getOrders, getProducts, getUsers } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        getOrders(),
        getProducts({ page: 1, limit: 100 }),
        getUsers(),
      ]);

      const orders = ordersRes?.data || [];
      const productsData = productsRes?.data || {};
      const users = usersRes?.data || [];

      const products = productsData.products || productsData || [];

      const totalRevenue = orders.reduce(
        (acc, order) => acc + (order.totalPrice || 0),
        0
      );

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Smart Hardware Store</title>
      </Helmet>

      <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-5">
          <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem', color: '#1a1a2e' }}>
            📊 Admin Dashboard
          </h1>
          <p className="text-secondary mb-0">Welcome back! Here's your business overview.</p>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="p-4 text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Users</p>
                    <h2 className="mb-2">{stats.totalUsers}</h2>
                    <small className="opacity-75">
                      <FaArrowUp className="me-1" size={14} />
                      Active members
                    </small>
                  </div>
                  <FaUsers size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="px-4 py-3">
                <ProgressBar 
                  now={Math.min(stats.totalUsers * 10, 100)} 
                  className="mb-0" 
                  style={{ height: '6px' }} 
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }} className="p-4 text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Products</p>
                    <h2 className="mb-2">{stats.totalProducts}</h2>
                    <small className="opacity-75">
                      <FaBox size={14} className="me-1" />
                      In inventory
                    </small>
                  </div>
                  <FaBox size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="px-4 py-3">
                <ProgressBar 
                  now={Math.min(stats.totalProducts * 5, 100)} 
                  variant="danger"
                  className="mb-0" 
                  style={{ height: '6px' }} 
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }} className="p-4 text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Orders</p>
                    <h2 className="mb-2">{stats.totalOrders}</h2>
                    <small className="opacity-75">
                      <FaShoppingCart size={14} className="me-1" />
                      Completed & pending
                    </small>
                  </div>
                  <FaShoppingCart size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="px-4 py-3">
                <ProgressBar 
                  now={Math.min(stats.totalOrders * 8, 100)} 
                  variant="info"
                  className="mb-0" 
                  style={{ height: '6px' }} 
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }} className="p-4 text-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1" style={{ opacity: 0.85 }}>Total Revenue</p>
                    <h2 className="mb-2">₹{(stats.totalRevenue / 1000).toFixed(1)}K</h2>
                    <small style={{ opacity: 0.85 }}>
                      <FaChartLine size={14} className="me-1" />
                      This period
                    </small>
                  </div>
                  <FaChartLine size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="px-4 py-3">
                <ProgressBar 
                  now={Math.min((stats.totalRevenue / 100000) * 100, 100)} 
                  variant="warning"
                  className="mb-0" 
                  style={{ height: '6px' }} 
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* Recent Orders */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <Card.Header className="border-0 bg-white p-4" style={{ borderBottom: '2px solid #f0f0f0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <FaClipboardList className="me-2 text-primary" />
                    Recent Orders
                  </h5>
                  <Badge bg="primary" className="rounded-pill">{recentOrders.length}</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <FaShoppingCart size={40} className="text-muted mb-3" />
                    <p className="text-muted">No orders yet</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table striped hover responsive className="mb-0">
                      <thead style={{ backgroundColor: '#f8f9fa', borderTop: 'none' }}>
                        <tr>
                          <th className="border-0 py-3 px-4 fw-bold text-secondary">Order ID</th>
                          <th className="border-0 py-3 px-4 fw-bold text-secondary">Customer</th>
                          <th className="border-0 py-3 px-4 fw-bold text-secondary">Date</th>
                          <th className="border-0 py-3 px-4 fw-bold text-secondary">Amount</th>
                          <th className="border-0 py-3 px-4 fw-bold text-secondary">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td className="py-3 px-4">
                              <code className="text-primary" style={{ fontSize: '0.85rem' }}>
                                {order._id?.substring(0, 8)}...
                              </code>
                            </td>
                            <td className="py-3 px-4">
                              <strong>{order.user?.name || 'Guest'}</strong>
                            </td>
                            <td className="py-3 px-4 text-secondary">
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-4">
                              <strong className="text-success">₹{order.totalPrice}</strong>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                bg={
                                  order.status === 'Delivered'
                                    ? 'success'
                                    : order.status === 'Shipped'
                                    ? 'info'
                                    : order.status === 'Processing'
                                    ? 'warning'
                                    : 'secondary'
                                }
                                className="px-3 py-2"
                              >
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions & Stats */}
          <Col lg={4}>
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <Card.Header className="border-0 bg-white p-4" style={{ borderBottom: '2px solid #f0f0f0' }}>
                <h5 className="mb-0 fw-bold">
                  <FaCog className="me-2 text-primary" />
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Button
                  as={Link}
                  to="/admin/products"
                  className="w-100 mb-3 fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <FaBox className="me-2" />
                  Manage Products
                </Button>

                <Button
                  as={Link}
                  to="/admin/orders"
                  className="w-100 mb-3 fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                  }}
                >
                  <FaShoppingCart className="me-2" />
                  View All Orders
                </Button>

                <Button
                  as={Link}
                  to="/admin/users"
                  className="w-100 fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                  }}
                >
                  <FaUsers className="me-2" />
                  Manage Users
                </Button>
              </Card.Body>
            </Card>

            {/* Summary Stats */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <Card.Header className="border-0 bg-white p-4" style={{ borderBottom: '2px solid #f0f0f0' }}>
                <h5 className="mb-0 fw-bold">
                  <FaArrowUp className="me-2 text-success" />
                  Quick Stats
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Avg. Order Value</span>
                    <strong className="text-primary">
                      ₹{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0}
                    </strong>
                  </div>
                  <small className="text-muted">Per transaction</small>
                </div>

                <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Conversion Rate</span>
                    <strong className="text-success">
                      {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </strong>
                  </div>
                  <small className="text-muted">Orders per user</small>
                </div>

                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Product Ratio</span>
                    <strong className="text-info">
                      {stats.totalProducts > 0 ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : 0}%
                    </strong>
                  </div>
                  <small className="text-muted">Orders per product</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminDashboard;