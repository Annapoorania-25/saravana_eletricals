import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Container, Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFilter, FaSearch } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getProducts, getCategories } from '../services/api';
import { Helmet } from 'react-helmet-async';

const ProductListPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filters
  const [keyword, setKeyword] = useState(queryParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Update state when URL query changes (e.g., using category links)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    setSelectedCategory(params.get('category') || '');
    setPage(1);
  }, [location.search]);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        keyword,
        category: selectedCategory,
        minPrice,
        maxPrice,
      };
      const { data } = await getProducts(params);
      setProducts(data.products);
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, keyword, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  // Poll for updates so changes made by admin become visible to users without needing a manual refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [fetchProducts]);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Products - Smart Hardware Store</title>
      </Helmet>

      <Container>
        <h1 className="my-4">Products</h1>

        <Row>
          <Col md={3}>
            <Button
              variant="outline-primary"
              className="mb-3 d-md-none"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
            </Button>

            <div className={`${showFilters ? 'd-block' : 'd-none'} d-md-block`}>
              <Card>
                <Card.Header>
                  <h5>Filters</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSearch}>
                    <Form.Group className="mb-3">
                      <Form.Label>Search</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Search products..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Button type="submit" variant="primary" className="ms-2">
                          <FaSearch />
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select value={selectedCategory} onChange={handleCategoryChange}>
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Price Range</Form.Label>
                      <Row>
                        <Col>
                          <Form.Control
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                          />
                        </Col>
                      </Row>
                    </Form.Group>

                    <Button variant="secondary" onClick={clearFilters} className="w-100">
                      Clear Filters
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Col>

          <Col md={9}>
            {loading ? (
              <Loader />
            ) : error ? (
              <Message variant="danger">{error}</Message>
            ) : (
              <>
                <Row>
                  {products.map((product) => (
                    <Col key={product._id} sm={12} md={6} lg={4} className="mb-4">
                      <Card className="product-card h-100">
                        <Card.Img
                          variant="top"
                          src={product.imageUrl}
                          alt={product.name}
                          className="img-fit-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                        />
                        <Card.Body>
                          <Card.Title>{product.name}</Card.Title>
                          <Card.Text>
                            <strong>₹{product.price}</strong>
                            <br />
                            <small className="text-muted">{product.category}</small>
                            <br />
                            <small>Stock: {product.stock}</small>
                          </Card.Text>
                          <Button
                            as={Link}
                            to={`/product/${product._id}`}
                            variant="primary"
                            className="w-100"
                          >
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Button
                      variant="outline-primary"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="mx-1"
                    >
                      Previous
                    </Button>
                    <span className="mx-3 align-self-center">
                      Page {page} of {pages}
                    </span>
                    <Button
                      variant="outline-primary"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pages}
                      className="mx-1"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ProductListPage;