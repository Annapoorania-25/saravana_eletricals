import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Container, Card, Button, Badge } from 'react-bootstrap';
import { 
  FaArrowRight, FaStar, FaTruck, FaShieldAlt, FaHeadset, 
  FaToolbox, FaBolt, FaWrench, FaPaintRoller, FaSeedling 
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getProducts, getRecommendations } from '../services/api';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    deliveries: 0,
    brands: 0
  });
  
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const displayedRecommendations = recommendations.length > 0 ? recommendations : products.slice(0, 4);

  useEffect(() => {
    fetchProducts();
    if (userInfo) {
      fetchRecommendations();
    }
    // Simulate stats (in real app, fetch from API)
    setStats({
      products: 1500,
      customers: 10000,
      deliveries: 25000,
      brands: 200
    });
  }, [userInfo]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts({ page: 1 });
      setProducts(data.products.slice(0, 8));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await getRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  // Category data with icons
  const categories = [
    { name: 'Tools', icon: <FaToolbox />, color: '#ff6b6b', count: 245 },
    { name: 'Electrical', icon: <FaBolt />, color: '#4ecdc4', count: 189 },
    { name: 'Plumbing', icon: <FaWrench />, color: '#45b7d1', count: 156 },
    { name: 'Paint', icon: <FaPaintRoller />, color: '#96ceb4', count: 98 },
    { name: 'Garden', icon: <FaSeedling />, color: '#ffeaa7', count: 134 },
    { name: 'Hardware', icon: <FaToolbox />, color: '#dfe6e9', count: 267 }
  ];

  return (
    <>
      <Helmet>
        <title>Smart Hardware Store - Home</title>
      </Helmet>

      {/* Hero Section */}
      <div className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
              <Badge bg="warning" text="dark" className="mb-3 px-3 py-2 rounded-pill">
                ⚡ New Arrivals Every Week
              </Badge>
              <h1 className="display-3 fw-bold mb-4">
                Your One-Stop Shop for <span className="text-warning">Hardware</span> Needs
              </h1>
              <p className="lead mb-4">
                Discover quality tools and equipment with AI-powered recommendations 
                and AR visualization. Professional grade hardware for every project.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                <Button 
                  as={Link} 
                  to="/products" 
                  variant="light" 
                  size="lg" 
                  className="rounded-pill px-4 py-3 fw-bold shadow"
                >
                  Shop Now <FaArrowRight className="ms-2" />
                </Button>
              </div>
              
              {/* Stats */}
              <Row className="mt-5 g-4">
                <Col xs={6} md={3}>
                  <div className="text-center">
                    <h3 className="h2 fw-bold mb-0">100+</h3>
                    <small>Products</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center">
                    <h3 className="h2 fw-bold mb-0">50+</h3>
                    <small>Happy Customers</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center">
                    <h3 className="h2 fw-bold mb-0">10+</h3>
                    <small>Deliveries</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center">
                    <h3 className="h2 fw-bold mb-0">{stats.brands}+</h3>
                    <small>Top Brands</small>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1581147036324-f1c1d5a6a39a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Hardware Tools" 
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="g-4">
          <Col md={4}>
            <div className="text-center p-4 bg-light rounded-4 h-100">
              <FaTruck size={40} className="text-primary mb-3" />
              <h5>Free Shipping</h5>
              <p className="text-secondary mb-0">On orders over ₹100</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center p-4 bg-light rounded-4 h-100">
              <FaShieldAlt size={40} className="text-primary mb-3" />
              <h5>Secure Payment</h5>
              <p className="text-secondary mb-0">100% secure transactions</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center p-4 bg-light rounded-4 h-100">
              <FaHeadset size={40} className="text-primary mb-3" />
              <h5>24/7 Support</h5>
              <p className="text-secondary mb-0">Dedicated customer service</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Categories Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">Shop by Category</h2>
          <p className="text-secondary">Find what you need in your favorite category</p>
        </div>
        <Row className="g-4">
          {categories.map((category, index) => (
            <Col key={index} xs={6} md={4} lg={2}>
              <Link 
                to={`/products?category=${category.name}`} 
                className="text-decoration-none"
              >
                <div 
                  className="text-center p-4 rounded-4 shadow-sm h-100"
                  style={{ 
                    backgroundColor: category.color + '20',
                    transition: 'transform 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2.5rem', color: category.color }}>
                    {category.icon}
                  </div>
                  <h6 className="mt-3 mb-1 fw-bold">{category.name}</h6>
                  <small className="text-secondary">{category.count} items</small>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Recommendations Section */}
      {userInfo && displayedRecommendations.length > 0 && (
        <Container className="py-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="display-6 fw-bold mb-0">Recommended for You</h2>
              <p className="text-secondary">
                {recommendations.length > 0
                  ? 'Based on your shopping history'
                  : 'Top picks for you'}
              </p>
            </div>
            <Badge bg="primary" className="rounded-pill px-3 py-2">
              <FaStar className="me-1" /> AI Powered
            </Badge>
          </div>
          <Row>
            {displayedRecommendations.slice(0, 4).map((product) => (
              <Col key={product._id} lg={3} md={6} className="mb-4">
                <Card className="h-100 shadow-sm product-card">
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={product.imageUrl} 
                      alt={product.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                    />
                    <Badge 
                      bg="warning" 
                      className="position-absolute top-0 end-0 m-2 rounded-pill"
                    >
                      Recommended
                    </Badge>
                  </div>
                  <Card.Body>
                    <Card.Title className="h6">{product.name}</Card.Title>
                    <Card.Text className="text-primary fw-bold mb-3">
                      ₹{product.price}
                    </Card.Text>
                    <Button 
                      as={Link} 
                      to={`/product/${product._id}`} 
                      variant="outline-primary" 
                      size="sm" 
                      className="w-100 rounded-pill"
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Featured Products */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">Featured Products</h2>
          <p className="text-secondary">Top selling items this week</p>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product._id} lg={3} md={4} sm={6} className="mb-4">
                <Card className="h-100 shadow-sm product-card">
                  <Card.Img 
                    variant="top" 
                    src={product.imageUrl} 
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="secondary" className="rounded-pill">
                        {product.category}
                      </Badge>
                      <small className="text-success fw-bold">In Stock</small>
                    </div>
                    <Card.Title className="h6 mb-3">{product.name}</Card.Title>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 text-primary mb-0">₹{product.price}</span>
                      <Button 
                        as={Link} 
                        to={`/product/${product._id}`} 
                        variant="primary" 
                        size="sm"
                        className="rounded-pill"
                      >
                        View
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="text-center mt-4">
          <Button 
            as={Link} 
            to="/products" 
            variant="outline-primary" 
            size="lg" 
            className="rounded-pill px-5"
          >
            View All Products <FaArrowRight className="ms-2" />
          </Button>
        </div>
      </Container>

      {/* Custom CSS */}
      <style>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 600px;
        }
        .product-card {
          transition: transform 0.3s, box-shadow 0.3s;
          border: none;
          border-radius: 15px;
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        .min-vh-50 {
          min-height: 50vh;
        }
        
        /* Badge responsive styling */
        .product-card .badge {
          white-space: nowrap;
          font-size: 0.75rem;
          padding: 0.4rem 0.6rem !important;
        }
        
        @media (max-width: 768px) {
          .hero-section {
            min-height: 400px;
          }
          .display-3 {
            font-size: 2rem;
          }
          
          /* Hide or adjust badge on mobile */
          .product-card .badge {
            display: none;
          }
        }
        
        @media (max-width: 576px) {
          .product-card .badge {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;