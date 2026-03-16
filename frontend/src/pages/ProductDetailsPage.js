import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge, Tab, Nav } from 'react-bootstrap';
import { 
  FaArrowLeft, FaCube, FaShoppingCart, FaHeart, FaShare, 
  FaStar, FaStarHalf, FaTruck, FaShieldAlt, FaUndo,
  FaCheck, FaFacebook, FaTwitter, FaWhatsapp 
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getProductById, getProducts, deleteProduct, addToCart as apiAddToCart } from '../services/api';
import { addToCart, setCartItems } from '../store/cartSlice';
import { Helmet } from 'react-helmet-async';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await getProductById(id);
      setProduct(data);

      // Load related products based on the same category
      const { data: relatedData } = await getProducts({ category: data.category, page: 1, limit: 8 });
      let filtered = relatedData.products.filter((p) => p._id !== data._id);

      // If there are no related products in the same category, fall back to top products.
      if (filtered.length === 0) {
        const { data: fallbackData } = await getProducts({ page: 1, limit: 4 });
        filtered = fallbackData.products.filter((p) => p._id !== data._id);
      }

      setRelatedProducts(filtered.slice(0, 4));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    try {
      const { data } = await apiAddToCart(product._id, quantity);
      // Store cart items in redux (and local storage) for UI state
      dispatch(setCartItems(data.cartItems || []));
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleARView = () => {
    navigate(`/ar-view/${product._id}`);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} at Smart Hardware Store!`;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank');
  };

  const calculateRating = () => {
    return 4.5; // This would come from product data
  };

  const renderRating = () => {
    const rating = calculateRating();
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalf key={i} className="text-warning" />);
      } else {
        stars.push(<FaStar key={i} className="text-secondary" />);
      }
    }
    return stars;
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!product) return <Message variant="info">Product not found</Message>;

  return (
    <>
      <Helmet>
        <title>{product.name} - Smart Hardware Store</title>
      </Helmet>

      <div className="product-details-page py-4">
        {/* Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate(-1)}
              className="rounded-pill px-4 py-2"
            >
              <FaArrowLeft className="me-2" /> Back
            </Button>

            {userInfo?.role === 'admin' && (
              <>
                <Button
                  variant="outline-warning"
                  className="rounded-pill px-4 py-2"
                  onClick={() => navigate(`/admin/products?edit=${product._id}`)}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline-danger"
                  className="rounded-pill px-4 py-2"
                  onClick={async () => {
                    if (!window.confirm('Delete this product?')) return;
                    try {
                      await deleteProduct(product._id);
                      toast.success('Product deleted');
                      navigate('/admin/products');
                    } catch (err) {
                      toast.error(err.response?.data?.message || err.message);
                    }
                  }}
                >
                  🗑️ Delete
                </Button>
              </>
            )}
          </div>

          <div>
            <Button 
              as={Link} 
              to="/products" 
              variant="outline-primary" 
              className="rounded-pill px-4 py-2 me-2"
            >
              All Products
            </Button>
            {userInfo?.role !== 'admin' && (
              <Button 
                as={Link} 
                to="/cart" 
                variant="primary" 
                className="rounded-pill px-4 py-2"
              >
                View Cart <FaShoppingCart className="ms-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Product Section */}
        <Row className="g-4 mb-5">
          {/* Product Images */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="position-relative">
                <Image 
                  src={product.imageUrl} 
                  alt={product.name} 
                  fluid 
                  className="w-100"
                  style={{ maxHeight: '500px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                />
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge 
                    bg="warning" 
                    className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill"
                  >
                    🔥 Low Stock
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge 
                    bg="danger" 
                    className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>
            </Card>
          </Col>

          {/* Product Info */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                {/* Category & Rating (customers only) */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Badge bg="primary" className="px-3 py-2 rounded-pill">
                    {product.category}
                  </Badge>
                  {userInfo?.role !== 'admin' && (
                    <div className="d-flex align-items-center">
                      {renderRating()}
                      <span className="ms-2 text-secondary">(24 reviews)</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="display-6 fw-bold mb-3">{product.name}</h1>

                {/* Price */}
                <div className="mb-4">
                  <span className="display-5 text-primary fw-bold">₹{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-secondary text-decoration-line-through ms-3">
                      ₹{product.oldPrice}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  {product.stock > 0 ? (
                    <div className="d-flex align-items-center text-success">
                      <FaCheck className="me-2" />
                      <span>In Stock ({product.stock} available)</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center text-danger">
                      <span>Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-secondary mb-4">{product.description}</p>

                {/* Features */}
                <div className="bg-light p-3 rounded-3 mb-4">
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaTruck className="text-primary me-2" />
                        <small>Free shipping over ₹100</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaShieldAlt className="text-primary me-2" />
                        <small>2 year warranty</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaUndo className="text-primary me-2" />
                        <small>30 day returns</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaCheck className="text-primary me-2" />
                        <small>Authentic products</small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Quantity & Actions (customer-only) */}
                {userInfo?.role !== 'admin' && product.stock > 0 && (
                  <>
                    <Row className="mb-4">
                      <Col md={4}>
                        <Form.Label className="fw-semibold">Quantity:</Form.Label>
                        <Form.Select
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="rounded-3"
                        >
                          {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>

                    <div className="d-flex gap-2 mb-4">
                      <Button
                        onClick={handleAddToCart}
                        variant="outline-primary"
                        className="flex-grow-1 py-3 rounded-3"
                        disabled={product.stock === 0}
                      >
                        <FaShoppingCart className="me-2" /> Add to Cart
                      </Button>
                      <Button
                        onClick={handleBuyNow}
                        variant="primary"
                        className="flex-grow-1 py-3 rounded-3"
                        disabled={product.stock === 0}
                      >
                        Buy Now
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="py-3 px-4 rounded-3"
                      >
                        <FaHeart />
                      </Button>
                    </div>
                  </>
                )}

                {/* AR View & Share */}
                <div className="d-flex gap-2">
                  <Button
                    onClick={handleARView}
                    variant="info"
                    className="flex-grow-1 py-3 rounded-3 text-white"
                  >
                    <FaCube className="me-2" /> View in 3D/AR
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="py-3 px-4 rounded-3"
                    onClick={() => handleShare('facebook')}
                  >
                    <FaFacebook />
                  </Button>
                  <Button
                    variant="outline-info"
                    className="py-3 px-4 rounded-3"
                    onClick={() => handleShare('twitter')}
                  >
                    <FaTwitter />
                  </Button>
                  <Button
                    variant="outline-success"
                    className="py-3 px-4 rounded-3"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <FaWhatsapp />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Product Details Tabs */}
        <Card className="border-0 shadow-sm rounded-4 mb-5">
          <Card.Header className="bg-white border-0 pt-4">
            <Nav variant="tabs" defaultActiveKey="description">
              <Nav.Item>
                <Nav.Link 
                  eventKey="description" 
                  onClick={() => setActiveTab('description')}
                  className={activeTab === 'description' ? 'active fw-bold' : ''}
                >
                  Description
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="specifications" 
                  onClick={() => setActiveTab('specifications')}
                  className={activeTab === 'specifications' ? 'active fw-bold' : ''}
                >
                  Specifications
                </Nav.Link>
              </Nav.Item>
              {userInfo?.role !== 'admin' && (
                <Nav.Item>
                  <Nav.Link 
                    eventKey="reviews" 
                    onClick={() => setActiveTab('reviews')}
                    className={activeTab === 'reviews' ? 'active fw-bold' : ''}
                  >
                    Reviews (24)
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Card.Header>
          <Card.Body className="p-4">
            {activeTab === 'description' && (
              <div>
                <h5 className="mb-3">Product Description</h5>
                <p className="text-secondary">{product.description}</p>
                <p className="text-secondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
                <ul className="text-secondary">
                  <li>High-quality materials</li>
                  <li>Durable construction</li>
                  <li>Easy to use</li>
                  <li>Professional grade</li>
                </ul>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div>
                <h5 className="mb-3">Technical Specifications</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="fw-semibold">Brand</span>
                    <span className="text-secondary">{product.brand || 'Generic'}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="fw-semibold">SKU</span>
                    <span className="text-secondary">{product.sku}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="fw-semibold">Category</span>
                    <span className="text-secondary">{product.category}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="fw-semibold">Weight</span>
                    <span className="text-secondary">2.5 kg</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="fw-semibold">Dimensions</span>
                    <span className="text-secondary">30 x 20 x 15 cm</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            )}
            {activeTab === 'reviews' && userInfo?.role !== 'admin' && (
              <div>
                <h5 className="mb-3">Customer Reviews</h5>
                <div className="text-center py-4">
                  <p className="text-secondary mb-3">No reviews yet. Be the first to review this product!</p>
                  <Button variant="primary" className="rounded-pill px-4">
                    Write a Review
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <div>
          <h3 className="mb-4">You might also like</h3>
          <Row className="g-4">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((related) => (
                <Col key={related._id} lg={3} md={4} sm={6}>
                  <Card className="h-100 shadow-sm border-0 rounded-4">
                    <Card.Img 
                      variant="top" 
                      src={related.imageUrl} 
                      alt={related.name}
                      className="img-fit-cover rounded-top-4"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                    />
                    <Card.Body className="p-3">
                      <Card.Title className="h6">{related.name}</Card.Title>
                      <Card.Text className="text-primary fw-bold mb-3">
                        ₹{related.price}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={`/product/${related._id}`} 
                        variant="outline-primary" 
                        size="sm"
                        className="w-100 rounded-pill"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Message variant="info">No related products found. Try exploring our catalog!</Message>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        .product-details-page {
          min-height: 80vh;
        }
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          padding: 10px 20px;
          margin-right: 10px;
        }
        .nav-tabs .nav-link.active {
          color: #007bff;
          background: none;
          border-bottom: 3px solid #007bff;
        }
        @media (max-width: 768px) {
          .display-6 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default ProductDetailsPage;