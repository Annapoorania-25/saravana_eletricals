import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaChartLine, 
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaShippingFast,
  FaCoins
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getOrders, getProducts, getUsers } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        getOrders(),
        getProducts({ page: 1, limit: 100 }),
        getUsers(),
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data.products || productsRes.data;
      const users = usersRes.data;

      const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      const processingOrders = orders.filter((o) => o.status === 'Processing').length;
      const shippedOrders = orders.filter((o) => o.status === 'Shipped').length;
      const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      });

      setRecentOrders(orders.slice(0, 10));
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  // Calculate order fulfillment percentage
  const fulfillmentRate = stats.totalOrders > 0 
    ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(0)
    : 0;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Smart Hardware Store</title>
      </Helmet>

      {/* Header Section */}
      <div className="dashboard-header mb-4 mt-3 p-4 rounded-3 bg-gradient-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 fw-bold">Admin Dashboard</h1>
            <p className="mb-0 opacity-80">Welcome back! Here's your business overview</p>
          </div>
          <Button
            variant="light"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="d-flex align-items-center gap-2"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <Row className="mb-5">
        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-primary h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Users</p>
                  <h3 className="mb-0 fw-bold">{stats.totalUsers}</h3>
                </div>
                <div className="stat-icon stat-icon-primary">
                  <FaUsers size={24} />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FaArrowUp size={14} className="text-success" />
                <small className="text-success fw-semibold">Growing community</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-success h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Products</p>
                  <h3 className="mb-0 fw-bold">{stats.totalProducts}</h3>
                </div>
                <div className="stat-icon stat-icon-success">
                  <FaBox size={24} />
                </div>
              </div>
              <ProgressBar 
                now={(stats.totalProducts / 100) * 100} 
                className="progress-sm"
              />
              <small className="text-muted mt-2 d-block">In Catalog</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-info h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Orders</p>
                  <h3 className="mb-0 fw-bold">{stats.totalOrders}</h3>
                </div>
                <div className="stat-icon stat-icon-info">
                  <FaShoppingCart size={24} />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success">{fulfillmentRate}% Delivered</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-warning h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Revenue</p>
                  <h3 className="mb-0 fw-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
                </div>
                <div className="stat-icon stat-icon-warning">
                  <FaCoins size={24} />
                </div>
              </div>
              <small className="text-muted">Total earnings</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Status Breakdown & Business Metrics */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Header className="bg-white border-bottom p-4">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <FaChartLine className="text-primary" /> Order Status Overview
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="status-box status-processing p-3 rounded-2">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaClock className="text-warning" size={20} />
                      <span className="fw-semibold text-dark">Processing</span>
                    </div>
                    <h4 className="mb-1 text-warning fw-bold">{stats.processingOrders}</h4>
                    <ProgressBar 
                      now={(stats.processingOrders / Math.max(stats.totalOrders, 1)) * 100}
                      variant="warning"
                      className="progress-sm"
                    />
                  </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="status-box status-shipped p-3 rounded-2">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaShippingFast className="text-info" size={20} />
                      <span className="fw-semibold text-dark">Shipped</span>
                    </div>
                    <h4 className="mb-1 text-info fw-bold">{stats.shippedOrders}</h4>
                    <ProgressBar 
                      now={(stats.shippedOrders / Math.max(stats.totalOrders, 1)) * 100}
                      variant="info"
                      className="progress-sm"
                    />
                  </div>
                </Col>
                <Col md={4}>
                  <div className="status-box status-delivered p-3 rounded-2">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaCheckCircle className="text-success" size={20} />
                      <span className="fw-semibold text-dark">Delivered</span>
                    </div>
                    <h4 className="mb-1 text-success fw-bold">{stats.deliveredOrders}</h4>
                    <ProgressBar 
                      now={(stats.deliveredOrders / Math.max(stats.totalOrders, 1)) * 100}
                      variant="success"
                      className="progress-sm"
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Header className="bg-white border-bottom p-4">
              <h6 className="mb-0 fw-bold">💰 Financial Metrics</h6>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="metric-item mb-3 pb-3 border-bottom">
                <p className="text-muted small mb-1">Average Order Value</p>
                <h4 className="mb-0 fw-bold text-primary">₹{stats.averageOrderValue.toFixed(0)}</h4>
              </div>
              <div className="metric-item mb-3 pb-3 border-bottom">
                <p className="text-muted small mb-1">Total Revenue</p>
                <h4 className="mb-0 fw-bold text-success">₹{stats.totalRevenue.toLocaleString('en-IN')}</h4>
              </div>
              <div className="metric-item">
                <p className="text-muted small mb-1">Avg Per Product</p>
                <h4 className="mb-0 fw-bold text-info">₹{(stats.totalRevenue / Math.max(stats.totalProducts, 1)).toFixed(0)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col lg={4} sm={6} className="mb-3">
          <Card className="action-card action-card-primary border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="action-icon action-icon-primary">
                  <FaBox size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Manage Products</h6>
                  <small className="text-muted">{stats.totalProducts} in catalog</small>
                </div>
              </div>
              <Button as={Link} to="/admin/products" variant="primary" size="sm" className="w-100">
                Go to Products
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} sm={6} className="mb-3">
          <Card className="action-card action-card-info border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="action-icon action-icon-info">
                  <FaShoppingCart size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Manage Orders</h6>
                  <small className="text-muted">{stats.totalOrders} total</small>
                </div>
              </div>
              <Button as={Link} to="/admin/orders" variant="info" size="sm" className="w-100">
                Go to Orders
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} sm={6} className="mb-3">
          <Card className="action-card action-card-success border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="action-icon action-icon-success">
                  <FaUsers size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Manage Users</h6>
                  <small className="text-muted">{stats.totalUsers} registered</small>
                </div>
              </div>
              <Button as={Link} to="/users" variant="success" size="sm" className="w-100">
                Go to Users
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card className="border-0 shadow-lg">
        <Card.Header className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <FaShoppingCart className="text-primary" /> Recent Orders
          </h6>
          <Button as={Link} to="/admin/orders" variant="link" size="sm" className="fw-semibold">
            View All Orders →
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {recentOrders.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-bottom hover-row">
                    <td className="px-4 py-3">
                      <small className="font-monospace fw-semibold">#{order._id.substring(0, 8)}</small>
                    </td>
                    <td className="px-4 py-3">{order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 fw-bold text-success">₹{order.totalPrice.toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge fw-semibold ${
                          order.status === 'Delivered'
                            ? 'bg-success'
                            : order.status === 'Shipped'
                            ? 'bg-info'
                            : order.status === 'Processing'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="p-5 text-center text-muted">
              <FaShoppingCart size={40} className="mb-3 opacity-50" />
              <p className="mb-0">No orders yet</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminDashboard;
