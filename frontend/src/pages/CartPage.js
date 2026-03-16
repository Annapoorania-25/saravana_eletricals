import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaLock, FaCreditCard, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import { removeFromCart, addToCart, setCartItems } from '../store/cartSlice';
import { getCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart } from '../services/api';
import { Helmet } from 'react-helmet-async';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  const loadCart = async () => {
    if (!userInfo) return;

    try {
      const { data } = await getCart();
      dispatch(setCartItems(data.cartItems || []));
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const removeFromCartHandler = async (id) => {
    if (!userInfo) {
      dispatch(removeFromCart(id));
      toast.success('Item removed from cart');
      return;
    }

    try {
      const { data } = await apiRemoveFromCart(id);
      dispatch(setCartItems(data.cartItems || []));
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const quantityChangeHandler = async (item, qty) => {
    if (qty > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }

    if (!userInfo) {
      dispatch(addToCart({ ...item, quantity: qty }));
      return;
    }

    try {
      const { data } = await apiUpdateCartItem(item._id, qty);
      dispatch(setCartItems(data.cartItems || []));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 10;
  const taxAmount = subtotal * 0.1; // 10% tax
  const totalAmount = subtotal + shippingCost + taxAmount;

  return (
    <>
      <Helmet>
        <title>Shopping Cart - Smart Hardware Store</title>
      </Helmet>

      <div className="cart-page py-4">
        {/* Header with navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(-1)}
            className="rounded-pill"
          >
            <FaArrowLeft className="me-2" /> Continue Shopping
          </Button>
          <h1 className="text-center mb-0 flex-grow-1">
            <FaShoppingCart className="me-3 text-primary" />
            Shopping Cart
          </h1>
          <div style={{ width: '130px' }}></div> {/* Spacer for alignment */}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <FaShoppingCart size={80} className="text-secondary opacity-50" />
            </div>
            <h2 className="mb-3">Your cart is empty</h2>
            <p className="text-secondary mb-4">Looks like you haven't added any items to your cart yet.</p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                as={Link} 
                to="/products" 
                variant="primary" 
                size="lg" 
                className="rounded-pill px-4"
              >
                Browse Products
              </Button>
              <Button 
                as={Link} 
                to="/" 
                variant="outline-secondary" 
                size="lg" 
                className="rounded-pill px-4"
              >
                Go to Home
              </Button>
            </div>
            
            {/* Featured categories */}
            <div className="mt-5">
              <h5 className="mb-3">Popular Categories</h5>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button as={Link} to="/products?category=Tools" variant="outline-primary" className="rounded-pill">
                  🔧 Tools
                </Button>
                <Button as={Link} to="/products?category=Electrical" variant="outline-primary" className="rounded-pill">
                  ⚡ Electrical
                </Button>
                <Button as={Link} to="/products?category=Plumbing" variant="outline-primary" className="rounded-pill">
                  💧 Plumbing
                </Button>
                <Button as={Link} to="/products?category=Paint" variant="outline-primary" className="rounded-pill">
                  🎨 Paint
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Row>
            {/* Cart Items Column */}
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="shadow-sm">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0">
                    Cart Items ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {cartItems.map((item, index) => (
                    <ListGroup.Item key={item.product} className="py-4">
                      <Row className="align-items-center">
                        {/* Product Image */}
                        <Col xs={3} md={2}>
                          <Image 
                            src={item.imageUrl} 
                            alt={item.name} 
                            fluid 
                            rounded 
                            className="border"
                            style={{ objectFit: 'cover', height: '80px', width: '80px' }}
                          />
                        </Col>
                        
                        {/* Product Name */}
                        <Col xs={9} md={4}>
                          <Link 
                            to={`/product/${item.product}`} 
                            className="text-decoration-none text-dark fw-bold"
                          >
                            {item.name}
                          </Link>
                          <div className="text-muted small mt-1">
                            {item.stock > 0 ? (
                              <span className="text-success">In Stock</span>
                            ) : (
                              <span className="text-danger">Out of Stock</span>
                            )}
                          </div>
                        </Col>
                        
                        {/* Price */}
                        <Col md={2} className="text-center mt-3 mt-md-0">
                          <div className="fw-bold text-primary">₹{item.price}</div>
                        </Col>
                        
                        {/* Quantity Selector */}
                        <Col md={2} className="mt-3 mt-md-0">
                          <Form.Select
                            size="sm"
                            value={item.quantity}
                            onChange={(e) =>
                              quantityChangeHandler(item, Number(e.target.value))
                            }
                            disabled={item.stock === 0}
                            className="w-75 mx-auto"
                          >
                            {[...Array(Math.min(item.stock || 10, 10)).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                Qty: {x + 1}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        
                        {/* Subtotal & Remove */}
                        <Col md={2} className="text-center mt-3 mt-md-0">
                          <div className="fw-bold mb-2">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => removeFromCartHandler(item.product)}
                          >
                            <FaTrash /> Remove
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>

            {/* Order Summary Column */}
            <Col lg={4}>
              <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0">Order Summary</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    {/* Subtotal */}
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
                    </ListGroup.Item>

                    {/* Shipping */}
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                      <span>
                        <FaTruck className="me-2 text-secondary" />
                        Shipping
                      </span>
                      {shippingCost === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        <span>₹{shippingCost.toFixed(2)}</span>
                      )}
                    </ListGroup.Item>

                    {/* Tax */}
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                      <span>
                        <FaCreditCard className="me-2 text-secondary" />
                        Estimated Tax
                      </span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </ListGroup.Item>

                    {/* Total */}
                    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 pt-3">
                      <span className="h5 mb-0">Total</span>
                      <span className="h5 mb-0 text-primary fw-bold">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </ListGroup.Item>

                    {/* Promo Code Note */}
                    <ListGroup.Item className="px-0">
                      <Form.Text className="text-muted">
                        <FaShieldAlt className="me-1" />
                        Secure checkout. Free shipping on orders over ₹100.
                      </Form.Text>
                    </ListGroup.Item>

                    {/* Checkout Button */}
                    <ListGroup.Item className="px-0">
                      <Button
                        type="button"
                        className="w-100 py-3 fw-bold"
                        disabled={cartItems.length === 0}
                        onClick={checkoutHandler}
                        variant="primary"
                        size="lg"
                      >
                        <FaLock className="me-2" />
                        Proceed to Checkout
                      </Button>
                    </ListGroup.Item>

                    {/* Payment Methods */}
                    <ListGroup.Item className="px-0 text-center">
                      <div className="d-flex justify-content-center gap-2 text-secondary">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>PayPal</span>
                        <span>COD</span>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              {/* Continue Shopping Card */}
              <Card className="shadow-sm mt-3">
                <Card.Body className="text-center">
                  <Button 
                    as={Link} 
                    to="/products" 
                    variant="outline-primary" 
                    className="w-100"
                  >
                    <FaArrowLeft className="me-2" /> Continue Shopping
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Recently Viewed or Recommendations (Optional) */}
        {cartItems.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-3">You might also like</h4>
            <Row>
              {/* You can add recommended products here */}
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Img variant="top" src="https://via.placeholder.com/200x150" />
                  <Card.Body>
                    <Card.Title>Product Name</Card.Title>
                    <Card.Text>
                      <strong>₹19.99</strong>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Img variant="top" src="https://via.placeholder.com/200x150" />
                  <Card.Body>
                    <Card.Title>Product Name</Card.Title>
                    <Card.Text>
                      <strong>₹24.99</strong>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Img variant="top" src="https://via.placeholder.com/200x150" />
                  <Card.Body>
                    <Card.Title>Product Name</Card.Title>
                    <Card.Text>
                      <strong>₹14.99</strong>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Img variant="top" src="https://via.placeholder.com/200x150" />
                  <Card.Body>
                    <Card.Title>Product Name</Card.Title>
                    <Card.Text>
                      <strong>₹29.99</strong>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Add custom CSS */}
      <style>{`
        .cart-page {
          min-height: 60vh;
        }
        .sticky-top {
          z-index: 1;
        }
        @media (max-width: 768px) {
          .cart-page h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default CartPage;