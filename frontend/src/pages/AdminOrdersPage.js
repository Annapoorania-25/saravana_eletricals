import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getOrders, updateOrderStatus } from '../services/api';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      setLoading(true);
      await updateOrderStatus(orderId, nextStatus);
      toast.success(`Order marked as ${nextStatus}`);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>All Orders - Admin</title>
      </Helmet>

      <h1 className="my-4">All Orders</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id.substring(0, 8)}...</td>
                <td>{order.user?.name || order.user?.email}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>₹{order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    new Date(order.paidAt).toLocaleDateString()
                  ) : (
                    <span className="text-danger">Not Paid</span>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    new Date(order.deliveredAt).toLocaleDateString()
                  ) : (
                    <span className="text-danger">Not Delivered</span>
                  )}
                </td>
                <td>
                  <span className={`badge bg-${
                    order.status === 'Delivered'
                      ? 'success'
                      : order.status === 'Shipped'
                      ? 'info'
                      : order.status === 'Processing'
                      ? 'warning'
                      : 'secondary'
                  }`}
                  >
                    {order.status === 'Processing' ? 'Packed' : order.status === 'Shipped' ? 'Delivering' : order.status}
                  </span>
                </td>
                <td className="d-flex gap-2">
                  <Button as={Link} to={`/order/${order._id}`} variant="light" size="sm">
                    <FaEye />
                  </Button>
                  {order.status === 'Pending' && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, 'Processing')}
                    >
                      Mark Packed
                    </Button>
                  )}
                  {order.status === 'Processing' && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                    >
                      Mark Delivering
                    </Button>
                  )}
                  {order.status === 'Shipped' && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminOrdersPage;
