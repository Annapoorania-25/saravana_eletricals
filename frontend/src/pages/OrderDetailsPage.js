import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Table, Button } from 'react-bootstrap';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getOrderById, updateOrderStatus } from '../services/api';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.user);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (nextStatus) => {
    try {
      setLoading(true);
      await updateOrderStatus(order._id, nextStatus);
      toast.success(`Order marked as ${nextStatus}`);
      await fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Order Details - Smart Hardware Store</title>
      </Helmet>

      <div className="my-4">
        <Button as={Link} to="/orders" variant="light" className="mb-4">
          <FaArrowLeft className="me-2" /> Back to Orders
        </Button>

        <h1 className="mb-4">Order Details</h1>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : !order ? (
          <Message variant="info">Order not found.</Message>
        ) : (
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <strong>Shipping</strong>
                </Card.Header>
                <Card.Body>
                  <p>
                    <strong>Name:</strong> {order.user?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a>
                  </p>
                  <p>
                    <strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                  </p>
                  <Message variant={order.isDelivered ? 'success' : 'warning'}>
                    {order.isDelivered ? (
                      <>
                        <FaCheck className="me-2" /> Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                      </>
                    ) : (
                      <>Not Delivered</>
                    )}
                  </Message>

                  <p className="mt-2">
                    <strong>Status:</strong>{' '}
                    {order.status === 'Processing' ? 'Packed' : order.status === 'Shipped' ? 'Delivering' : order.status}
                  </p>

                  {userInfo?.role === 'admin' && order.status !== 'Delivered' && (
                    <div className="mt-3">
                      {order.status === 'Pending' && (
                        <Button
                          variant="info"
                          onClick={() => handleStatusUpdate('Processing')}
                        >
                          Mark as Packed
                        </Button>
                      )}
                      {order.status === 'Processing' && (
                        <Button
                          variant="primary"
                          onClick={() => handleStatusUpdate('Shipped')}
                        >
                          Mark as Delivering
                        </Button>
                      )}
                      {order.status === 'Shipped' && (
                        <Button
                          variant="success"
                          onClick={() => handleStatusUpdate('Delivered')}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <strong>Payment</strong>
                </Card.Header>
                <Card.Body>
                  <p>
                    <strong>Method:</strong> {order.paymentMethod}
                  </p>
                  <Message variant={order.isPaid ? 'success' : 'warning'}>
                    {order.isPaid ? (
                      <>
                        <FaCheck className="me-2" /> Paid on {new Date(order.paidAt).toLocaleDateString()}
                      </>
                    ) : (
                      <>Not Paid</>
                    )}
                  </Message>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <strong>Order Items</strong>
                </Card.Header>
                <Card.Body>
                  {order.orderItems.length === 0 ? (
                    <Message>No items in this order.</Message>
                  ) : (
                    <Table responsive="sm" className="align-middle">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((item) => (
                          <tr key={item.product}>
                            <td>
                              <Link to={`/product/${item.product}`} className="text-decoration-none">
                                {item.name}
                              </Link>
                            </td>
                            <td>{item.qty}</td>
                            <td>₹{item.price}</td>
                            <td>₹{(item.qty * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Header>
                  <strong>Order Summary</strong>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Items</span>
                      <span>₹{order.itemsPrice.toFixed(2)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Shipping</span>
                      <span>₹{order.shippingPrice.toFixed(2)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Tax</span>
                      <span>₹{order.taxPrice.toFixed(2)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Total</strong>
                      <strong>₹{order.totalPrice.toFixed(2)}</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default OrderDetailsPage;
