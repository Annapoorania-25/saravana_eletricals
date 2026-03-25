import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaShoppingCart, FaChartLine } from 'react-icons/fa';
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

      <div className="p-4" style={{ backgroundColor: '#f6f8fb', minHeight: '100vh' }}>
        <div className="mb-5">
          <h1 className="fw-bold mb-2" style={{ fontSize: '2.2rem', color: '#223142' }}>
            Admin Dashboard
          </h1>
          <p className="text-secondary">Key metrics and actions for managing your store.</p>
        </div>

        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #dbe7ff 0%, #c7d9ff 100%)' }} className="p-3 text-dark">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Users</p>
                    <h2 className="mb-2">{stats.totalUsers}</h2>
                    <small className="opacity-75">Active members</small>
                  </div>
                  <FaUsers size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="py-3 px-3">
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${Math.min(stats.totalUsers * 10, 100)}%` }} aria-valuenow={Math.min(stats.totalUsers * 10, 100)} aria-valuemin="0" aria-valuemax="100" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #fce9f4 0%, #fad9e9 100%)' }} className="p-3 text-dark">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Products</p>
                    <h2 className="mb-2">{stats.totalProducts}</h2>
                    <small className="opacity-75">In inventory</small>
                  </div>
                  <FaBox size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="py-3 px-3">
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${Math.min(stats.totalProducts * 5, 100)}%` }} aria-valuenow={Math.min(stats.totalProducts * 5, 100)} aria-valuemin="0" aria-valuemax="100" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #dbf3ff 0%, #c9efff 100%)' }} className="p-3 text-dark">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Orders</p>
                    <h2 className="mb-2">{stats.totalOrders}</h2>
                    <small className="opacity-75">Completed + pending</small>
                  </div>
                  <FaShoppingCart size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="py-3 px-3">
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-info" role="progressbar" style={{ width: `${Math.min(stats.totalOrders * 8, 100)}%` }} aria-valuenow={Math.min(stats.totalOrders * 8, 100)} aria-valuemin="0" aria-valuemax="100" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #fff4db 0%, #fcede4 100%)' }} className="p-3 text-dark">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75">Total Revenue</p>
                    <h2 className="mb-2">₹{(stats.totalRevenue / 1000).toFixed(1)}K</h2>
                    <small className="opacity-75">This period</small>
                  </div>
                  <FaChartLine size={35} className="opacity-50" />
                </div>
              </div>
              <Card.Body className="py-3 px-3">
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${Math.min((stats.totalRevenue / 100000) * 100, 100)}%` }} aria-valuenow={Math.min((stats.totalRevenue / 100000) * 100, 100)} aria-valuemin="0" aria-valuemax="100" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
              <Card.Header className="border-0 bg-white p-4" style={{ borderBottom: '1px solid #ebf0f8' }}>
                <h5 className="mb-0 fw-bold">Recent Orders</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {recentOrders.length === 0 ? (
                  <div className="py-5 text-center text-muted">No orders yet</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table striped hover borderless className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id}>
                            <td><code>{order._id?.substring(0, 8)}...</code></td>
                            <td>{order.user?.name || 'Guest'}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="text-success">₹{order.totalPrice}</td>
                            <td>
                              <span className={`badge bg-${
                                order.status === 'Delivered' ? 'success' :
                                order.status === 'Shipped' ? 'info' :
                                order.status === 'Processing' ? 'warning' : 'secondary'
                              }`}>{order.status}</span>
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

          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
              <Card.Header className="border-0 bg-white p-4" style={{ borderBottom: '1px solid #ebf0f8' }}>
                <h5 className="mb-0 fw-bold">Quick Actions</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Button as={Link} to="/admin/products" className="w-100 mb-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>Manage Products</Button>
                <Button as={Link} to="/admin/orders" className="w-100 mb-3" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none' }}>View Orders</Button>
                <Button as={Link} to="/admin/users" className="w-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none' }}>Manage Users</Button>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
              <Card.Header className="border-0 bg-white p-4" style={{ borderBottom: '1px solid #ebf0f8' }}>
                <h5 className="mb-0 fw-bold">Performance</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2"><span>Avg Order Value</span><strong className="text-primary">₹{stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : '0'}</strong></div>
                  <div className="progress" style={{ height: '6px' }}><div className="progress-bar" style={{ width: `${stats.totalOrders ? Math.min((stats.totalRevenue / stats.totalOrders) / 2000 * 100, 100) : 0}%` }}></div></div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2"><span>Conversion Rate</span><strong className="text-success">{stats.totalUsers ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : '0.0'}%</strong></div>
                  <div className="progress" style={{ height: '6px' }}><div className="progress-bar bg-success" style={{ width: `${stats.totalUsers ? Math.min((stats.totalOrders / stats.totalUsers) * 100, 100) : 0}%` }}></div></div>
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-2"><span>Inventory Coverage</span><strong className="text-info">{stats.totalProducts ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : '0.0'}%</strong></div>
                  <div className="progress" style={{ height: '6px' }}><div className="progress-bar bg-info" style={{ width: `${stats.totalProducts ? Math.min((stats.totalOrders / stats.totalProducts) * 100, 100) : 0}%` }}></div></div>
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