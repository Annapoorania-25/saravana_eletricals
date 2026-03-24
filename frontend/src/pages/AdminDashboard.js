import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaShoppingCart, FaChartLine, FaSync } from 'react-icons/fa';
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
    processingOrders: 0,
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

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue,
        processingOrders,
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

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Smart Hardware Store</title>
      </Helmet>

      <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
        <h1>Admin Dashboard</h1>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={fetchDashboardData}
          disabled={refreshing}
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted small">Total Users</p>
                  <h4 className="mb-0">{stats.totalUsers}</h4>
                </div>
                <FaUsers size={30} className="text-primary opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted small">Total Products</p>
                  <h4 className="mb-0">{stats.totalProducts}</h4>
                </div>
                <FaBox size={30} className="text-success opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted small">Total Orders</p>
                  <h4 className="mb-0">{stats.totalOrders}</h4>
                </div>
                <FaShoppingCart size={30} className="text-info opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted small">Total Revenue</p>
                  <h4 className="mb-0">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h4>
                </div>
                <FaChartLine size={30} className="text-warning opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Info and Quick Actions */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-bottom">
              <h6 className="mb-0">Business Summary</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <div className="p-3 bg-light rounded">
                    <p className="text-muted mb-1 small">Average Order Value</p>
                    <h5>₹{stats.averageOrderValue.toFixed(0)}</h5>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="p-3 bg-light rounded">
                    <p className="text-muted mb-1 small">Processing Orders</p>
                    <h5 className="text-warning">{stats.processingOrders}</h5>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="p-3 bg-light rounded">
                    <p className="text-muted mb-1 small">Total Revenue</p>
                    <h5>₹{stats.totalRevenue.toLocaleString('en-IN')}</h5>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-bottom">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/admin/products" variant="primary">
                  Manage Products
                </Button>
                <Button as={Link} to="/admin/orders" variant="info">
                  Manage Orders
                </Button>
                <Button as={Link} to="/users" variant="secondary">
                  Manage Users
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Orders</h6>
              <Button as={Link} to="/admin/orders" variant="link" size="sm">
                View All Orders
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length > 0 ? (
                <Table hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-3">Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-3">
                          <small className="font-monospace">{order._id.substring(0, 8)}...</small>
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
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted">
                  No orders yet
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
