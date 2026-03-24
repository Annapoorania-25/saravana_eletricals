import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaRefresh,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrendingUp,
  FaEye,
  FaPlusCircle,
  FaUserPlus,
} from 'react-icons/fa';
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
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
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

      // Find low stock products (stock < 5)
      const lowStock = products
        .filter((p) => p.stock < 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      // Get recent users (last 5)
      const recent = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue,
      });

      setRecentOrders(orders.slice(0, 8));
      setRecentUsers(recent);
      setLowStockProducts(lowStock);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Smart Hardware Store</title>
      </Helmet>

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
        <div>
          <h1 className="mb-0">Admin Dashboard</h1>
          <small className="text-muted">Welcome back! Here's your business overview.</small>
        </div>
        <Button
          variant="outline-secondary"
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="d-flex align-items-center gap-2"
        >
          <FaRefresh className={refreshing ? 'spinner' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderLeft: '4px solid #0d6efd' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>
                    Total Users
                  </p>
                  <h3 className="mb-0">{stats.totalUsers}</h3>
                  <small className="text-success d-flex align-items-center gap-1 mt-2">
                    <FaTrendingUp size={12} /> Growing Community
                  </small>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>
                  <FaUsers />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderLeft: '4px solid #198754' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>
                    Total Products
                  </p>
                  <h3 className="mb-0">{stats.totalProducts}</h3>
                  <small className="text-info d-flex align-items-center gap-1 mt-2">
                    <FaEye size={12} /> In Catalog
                  </small>
                </div>
                <div className="text-success" style={{ fontSize: '2rem' }}>
                  <FaBox />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderLeft: '4px solid #0dcaf0' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>
                    Total Orders
                  </p>
                  <h3 className="mb-0">{stats.totalOrders}</h3>
                  <small className="text-info d-flex align-items-center gap-1 mt-2">
                    ₹{stats.averageOrderValue.toFixed(0)} avg value
                  </small>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>
                  <FaShoppingCart />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderLeft: '4px solid #ffc107' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>
                    Total Revenue
                  </p>
                  <h3 className="mb-0">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
                  <small className="text-warning d-flex align-items-center gap-1 mt-2">
                    <FaChartLine size={12} /> Strong Growth
                  </small>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>
                  <FaChartLine />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      {lowStockProducts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0 border-start border-warning">
              <Card.Header className="bg-light d-flex align-items-center gap-2 border-0">
                <FaExclamationTriangle className="text-warning" />
                <h6 className="mb-0">Low Stock Alert</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {lowStockProducts.map((product) => (
                    <Col md={6} lg={4} key={product._id} className="mb-2">
                      <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ backgroundColor: '#fff3cd' }}>
                        <div className="flex-grow-1">
                          <small className="text-dark fw-bold d-block text-truncate">{product.name}</small>
                          <small className="text-muted">Stock: {product.stock}</small>
                        </div>
                        <Button as={Link} to="/admin/products" size="sm" variant="warning" className="ms-2">
                          Restock
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content Area */}
      <Row className="mb-4">
        {/* Recent Orders */}
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center border-0">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaShoppingCart /> Recent Orders
              </h6>
              <Button as={Link} to="/admin/orders" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr className="bg-light">
                    <th className="px-3">Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-3">
                          <small className="text-muted font-monospace">
                            {order._id.substring(0, 8)}...
                          </small>
                        </td>
                        <td>{order.user?.name || 'N/A'}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="fw-bold">₹{order.totalPrice.toFixed(0)}</td>
                        <td>
                          <span
                            className={`badge ${
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions & Recent Users */}
        <Col lg={4} className="mb-4">
          {/* Quick Actions */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0">⚡ Quick Actions</h6>
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              <Button
                as={Link}
                to="/admin/products"
                variant="primary"
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <FaBox /> Manage Products
              </Button>
              <Button
                as={Link}
                to="/admin/orders"
                variant="info"
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <FaShoppingCart /> Manage Orders
              </Button>
              <Button
                as={Link}
                to="/users"
                variant="secondary"
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <FaUsers /> Manage Users
              </Button>
            </Card.Body>
          </Card>

          {/* Recent Users */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <FaUserPlus /> Recent Users
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user._id} className="list-group-item px-3 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <p className="mb-0 small fw-bold text-truncate">{user.name}</p>
                          <small className="text-muted text-truncate" style={{ display: 'block' }}>
                            {user.email}
                          </small>
                        </div>
                        <small className="text-muted ml-2 text-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted">
                    <small>No users yet</small>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;