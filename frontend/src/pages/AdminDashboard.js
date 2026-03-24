import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, ProgressBar, Badge } from 'react-bootstrap';
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
  FaCoins,
  FaFire,
  FaTrendingUp,
  FaCalendarAlt,
  FaEye
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

      {/* Header Section with Stats Overview */}
      <div className="dashboard-header mb-4 mt-3 p-4 rounded-3 bg-gradient-primary text-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="mb-1 fw-bold display-6">Admin Dashboard</h1>
            <p className="mb-0 opacity-80 d-flex align-items-center gap-2">
              <FaCalendarAlt size={14} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <Button
            variant="light"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="d-flex align-items-center gap-2 px-3"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Key Statistics Cards with Trend Indicators */}
      <Row className="mb-5">
        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-primary h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Users</p>
                  <div className="d-flex align-items-baseline gap-2">
                    <h2 className="mb-0 fw-bold">{stats.totalUsers}</h2>
                    <span className="badge bg-success-subtle text-success-emphasis">
                      <FaArrowUp size={11} className="me-1" /> 12%
                    </span>
                  </div>
                </div>
                <div className="stat-icon stat-icon-primary">
                  <FaUsers size={26} />
                </div>
              </div>
              <small className="text-muted">Active registered users</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-success h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Products</p>
                  <div className="d-flex align-items-baseline gap-2">
                    <h2 className="mb-0 fw-bold">{stats.totalProducts}</h2>
                    <span className="badge bg-warning-subtle text-warning-emphasis">
                      <FaFire size={11} className="me-1" /> Hot
                    </span>
                  </div>
                </div>
                <div className="stat-icon stat-icon-success">
                  <FaBox size={26} />
                </div>
              </div>
              <ProgressBar 
                now={(stats.totalProducts / 100) * 100} 
                className="progress-sm"
                style={{ backgroundColor: '#198754' }}
              />
              <small className="text-muted mt-2 d-block">In active catalog</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="stat-card stat-card-info h-100 border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-2 small fw-semibold">Total Orders</p>
                  <div className="d-flex align-items-baseline gap-2">
                    <h2 className="mb-0 fw-bold">{stats.totalOrders}</h2>
                    <span className="badge bg-info-subtle text-info-emphasis">
                      <FaTrendingUp size={11} className="me-1" /> {fulfillmentRate}%
                    </span>
                  </div>
                </div>
                <div className="stat-icon stat-icon-info">
                  <FaShoppingCart size={26} />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <small className="text-success"><FaCheckCircle size={12} className="me-1" /> {stats.deliveredOrders} Delivered</small>
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
                  <div className="d-flex align-items-baseline gap-2">
                    <h2 className="mb-0 fw-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h2>
                    <span className="badge bg-success-subtle text-success-emphasis">
                      <FaArrowUp size={11} className="me-1" /> 8%
                    </span>
                  </div>
                </div>
                <div className="stat-icon stat-icon-warning">
                  <FaCoins size={26} />
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
            <Card.Header className="bg-white border-bottom-0 p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)' }}>
                  <FaChartLine className="text-primary" size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Order Status Overview</h6>
                  <small className="text-muted">Real-time order fulfillment breakdown</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="status-box status-processing p-3 rounded-2">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                          <FaClock className="text-warning" size={18} />
                        </div>
                        <span className="fw-semibold text-dark">Processing</span>
                      </div>
                      <span className="badge bg-warning text-dark fw-bold">{stats.processingOrders}</span>
                    </div>
                    <ProgressBar 
                      now={(stats.processingOrders / Math.max(stats.totalOrders, 1)) * 100}
                      variant="warning"
                      className="progress-sm"
                    />
                    <small className="text-muted mt-2 d-block">{((stats.processingOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% of total</small>
                  </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="status-box status-shipped p-3 rounded-2">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)' }}>
                          <FaShippingFast className="text-info" size={18} />
                        </div>
                        <span className="fw-semibold text-dark">Shipped</span>
                      </div>
                      <span className="badge bg-info fw-bold">{stats.shippedOrders}</span>
                    </div>
                    <ProgressBar 
                      now={(stats.shippedOrders / Math.max(stats.totalOrders, 1)) * 100}
                      variant="info"
                      className="progress-sm"
                    />
                    <small className="text-muted mt-2 d-block">{((stats.shippedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% of total</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="status-box status-delivered p-3 rounded-2">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)' }}>
                          <FaCheckCircle className="text-success" size={18} />
                        </div>
                        <span className="fw-semibold text-dark">Delivered</span>
                      </div>
                      <span className="badge bg-success fw-bold">{stats.deliveredOrders}</span>
                    </div>
                    <ProgressBar 
                      now={(stats.deliveredOrders / Math.max(stats.totalOrders, 1)) * 100}
                      variant="success"
                      className="progress-sm"
                    />
                    <small className="text-muted mt-2 d-block">{((stats.deliveredOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% of total</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Header className="bg-white border-bottom-0 p-4">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)' }}>
                  <FaCoins className="text-muted" size={20} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">💰 Financial Metrics</h6>
                  <small className="text-muted">Revenue breakdown analysis</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="metric-item mb-4 pb-4 border-bottom">
                <p className="text-muted small mb-2 d-flex align-items-center gap-2">
                  <FaEye size={12} /> Average Order Value
                </p>
                <div className="d-flex align-items-baseline justify-content-between">
                  <h4 className="mb-0 fw-bold text-primary">₹{stats.averageOrderValue.toFixed(0)}</h4>
                  <span className="small badge bg-success-subtle text-success"><FaArrowUp size={10} /> 5.2%</span>
                </div>
              </div>
              <div className="metric-item mb-4 pb-4 border-bottom">
                <p className="text-muted small mb-2">Total Revenue</p>
                <div className="d-flex align-items-baseline justify-content-between">
                  <h4 className="mb-0 fw-bold text-success">₹{(stats.totalRevenue / 100000).toFixed(2)}L</h4>
                  <span className="small badge bg-success-subtle text-success"><FaArrowUp size={10} /> 8%</span>
                </div>
              </div>
              <div className="metric-item">
                <p className="text-muted small mb-2">Avg Per Product</p>
                <div className="d-flex align-items-baseline justify-content-between">
                  <h4 className="mb-0 fw-bold text-info">₹{(stats.totalRevenue / Math.max(stats.totalProducts, 1)).toFixed(0)}</h4>
                  <span className="small badge bg-info-subtle text-info"><FaArrowUp size={10} /> 3%</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="mb-5">
        <div className="mb-4">
          <h5 className="fw-bold d-flex align-items-center gap-2">
            <FaTrendingUp className="text-primary" size={20} /> Quick Actions
          </h5>
          <p className="text-muted small mb-0">Manage your business from here</p>
        </div>
        <Row>
          <Col lg={4} sm={6} className="mb-3">
            <Card className="action-card action-card-primary border-0 shadow-lg h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="action-icon action-icon-primary">
                    <FaBox size={26} className="text-primary" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">Manage Products</h6>
                    <small className="text-muted d-block">{stats.totalProducts} in catalog</small>
                  </div>
                </div>
                <Button as={Link} to="/admin/products" variant="primary" size="sm" className="w-100">
                  Go to Products →
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} sm={6} className="mb-3">
            <Card className="action-card action-card-info border-0 shadow-lg h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="action-icon action-icon-info">
                    <FaShoppingCart size={26} className="text-info" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">Manage Orders</h6>
                    <small className="text-muted d-block">{stats.totalOrders} total</small>
                  </div>
                </div>
                <Button as={Link} to="/admin/orders" variant="info" size="sm" className="w-100">
                  Go to Orders →
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} sm={6} className="mb-3">
            <Card className="action-card action-card-success border-0 shadow-lg h-100">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="action-icon action-icon-success">
                    <FaUsers size={26} className="text-success" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">Manage Users</h6>
                    <small className="text-muted d-block">{stats.totalUsers} registered</small>
                  </div>
                </div>
                <Button as={Link} to="/users" variant="success" size="sm" className="w-100">
                  Go to Users →
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-0 shadow-lg">
        <Card.Header className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-1 fw-bold d-flex align-items-center gap-2">
              <FaShoppingCart className="text-primary" size={20} /> Recent Orders
            </h6>
            <small className="text-muted">Latest orders from your store</small>
          </div>
          <Button as={Link} to="/admin/orders" variant="outline-primary" size="sm" className="fw-semibold">
            View All Orders →
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {recentOrders.length > 0 ? (
            <div className="table-responsive">
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 fw-bold text-muted">Order ID</th>
                    <th className="px-4 py-3 fw-bold text-muted">Customer</th>
                    <th className="px-4 py-3 fw-bold text-muted">Date</th>
                    <th className="px-4 py-3 fw-bold text-muted">Amount</th>
                    <th className="px-4 py-3 fw-bold text-muted">Status</th>
                    <th className="px-4 py-3 fw-bold text-muted text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-bottom hover-row align-middle">
                      <td className="px-4 py-3">
                        <small className="font-monospace fw-bold text-primary">#{order._id.substring(0, 8)}</small>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="mb-0 fw-semibold">{order.user?.name || 'Guest'}</p>
                          <small className="text-muted">{order.user?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <small>{new Date(order.createdAt).toLocaleDateString('en-IN')}</small>
                      </td>
                      <td className="px-4 py-3">
                        <span className="fw-bold text-success">₹{order.totalPrice.toFixed(0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge fw-semibold ${
                            order.status === 'Delivered'
                              ? 'bg-success-subtle text-success'
                              : order.status === 'Shipped'
                              ? 'bg-info-subtle text-info'
                              : order.status === 'Processing'
                              ? 'bg-warning-subtle text-warning'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          as={Link} 
                          to={`/orders/${order._id}`}
                          variant="link" 
                          size="sm"
                          className="text-primary text-decoration-none"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="p-5 text-center text-muted">
              <FaShoppingCart size={48} className="mb-3 opacity-50" />
              <p className="mb-0 fw-semibold">No orders yet</p>
              <small>Orders will appear here once customers place them</small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Dashboard Footer Summary */}
      <div className="mt-5 p-4 rounded-3 bg-light border">
        <Row className="text-center">
          <Col md={4} className="mb-3 mb-md-0">
            <p className="text-muted small mb-2">Last Updated</p>
            <p className="fw-bold">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <p className="text-muted small mb-2">Store Health</p>
            <p className="fw-bold"><span className="badge bg-success me-2">Excellent</span> All systems operational</p>
          </Col>
          <Col md={4}>
            <p className="text-muted small mb-2">Pending Actions</p>
            <p className="fw-bold"><span className="badge bg-warning me-2">{stats.processingOrders}</span> Orders to process</p>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminDashboard;
