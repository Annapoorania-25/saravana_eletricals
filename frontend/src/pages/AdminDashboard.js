import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
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

      <div className="container-fluid py-4" style={{ background: "#eef2f7", minHeight: "100vh" }}>
        {/* Header */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">Dashboard Overview</h2>
            <p className="text-muted mb-0">Track your store performance in real-time</p>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          {/** Users Card */}
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 glass-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Users</small>
                  <h3 className="fw-bold">{stats.totalUsers}</h3>
                </div>
                <div className="icon-circle bg-primary text-white">
                  <FaUsers />
                </div>
              </div>
            </Card>
          </Col>

          {/** Products Card */}
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 glass-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Products</small>
                  <h3 className="fw-bold">{stats.totalProducts}</h3>
                </div>
                <div className="icon-circle bg-success text-white">
                  <FaBox />
                </div>
              </div>
            </Card>
          </Col>

          {/** Orders Card */}
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 glass-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Orders</small>
                  <h3 className="fw-bold">{stats.totalOrders}</h3>
                </div>
                <div className="icon-circle bg-info text-white">
                  <FaShoppingCart />
                </div>
              </div>
            </Card>
          </Col>

          {/** Revenue Card */}
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3 glass-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Revenue</small>
                  <h3 className="fw-bold text-success">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="icon-circle bg-warning text-white">
                  <FaChartLine />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Section */}
        <Row className="g-4">
          {/* Recent Orders */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 glass-card">
              <Card.Header className="bg-white border-0 fw-semibold">
                Recent Orders <Badge bg="primary">{recentOrders.length}</Badge>
              </Card.Header>
              <Card.Body>
                {recentOrders.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <FaShoppingCart size={40} />
                    <p className="mt-2">No orders yet</p>
                  </div>
                ) : (
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id?.substring(0, 6)}</td>
                          <td>{order.user?.name || "Guest"}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="fw-semibold text-success">₹{order.totalPrice}</td>
                          <td>
                            <Badge 
                              bg={
                                order.status === "Delivered"
                                  ? "success"
                                  : order.status === "Shipped"
                                  ? "info"
                                  : order.status === "Processing"
                                  ? "warning text-dark"
                                  : "secondary"
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
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 glass-card mb-4">
              <Card.Header className="bg-white border-0 fw-semibold">Quick Actions</Card.Header>
              <Card.Body className="d-flex flex-column gap-2">
                <Button as={Link} to="/admin/products" className="w-100 rounded-3" variant="primary">
                  Manage Products
                </Button>
                <Button as={Link} to="/admin/orders" className="w-100 rounded-3" variant="info">
                  Manage Orders
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Glassmorphism CSS */}
      <style>
        {`
          .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
          }
          .icon-circle {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 1.25rem;
          }
        `}
      </style>
    </>
  );
};

export default AdminDashboard;