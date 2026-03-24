import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, ContactShadows, useGLTF } from '@react-three/drei';
import { Container, Button } from 'react-bootstrap';
import * as THREE from 'three';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getProductById, updateProduct } from '../services/api';

function Model({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  // Normalize scale/position so the model fits nicely in the view regardless of source units
  useEffect(() => {
    if (!ref.current) return;

    ref.current.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = maxDimension === 0 ? 1 : 2 / maxDimension;

    ref.current.scale.setScalar(scale);
    ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [url]);

  return <primitive ref={ref} object={scene} />;
}

const ARViewerPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [arChecked, setArChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Default model for preview & AR (require upload to avoid invalid placeholder file)
  const { userInfo } = useSelector((state) => state.user);
  const isAdmin = userInfo?.role === 'admin';

  const [modelUrl, setModelUrl] = useState(null);
  const [modelError, setModelError] = useState(null);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    fetchProduct();

    // Detect mobile devices for AR experience (model-viewer / Scene Viewer / Quick Look)
    const isMobileDevice = /android|iphone|ipad|ipod/i.test(navigator.userAgent || '');
    setIsMobile(isMobileDevice);

    // Check if WebXR immersive-ar is available on this device/browser
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then((supported) => {
          setArSupported(supported);
          setArChecked(true);
        })
        .catch(() => {
          setArSupported(false);
          setArChecked(true);
        });
    } else {
      setArSupported(false);
      setArChecked(true);
    }
  }, [productId]);

  // Auto-open AR on mobile when model loads
  useEffect(() => {
    if (isMobile && modelUrl && modelViewerRef.current) {
      // Increase delay and ensure model is fully loaded before AR activation
      const timer = setTimeout(() => {
        if (modelViewerRef.current?.activateAR) {
          modelViewerRef.current.activateAR();
        }
      }, 2000); // Increased delay to ensure full model load

      return () => clearTimeout(timer);
    }
  }, [isMobile, modelUrl]);

  // Cleanup any object URLs when the selected model changes / component unmounts
  useEffect(() => {
    return () => {
      if (modelUrl && modelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await getProductById(productId);
      setProduct(data);
      setModelUrl(data.modelUrl || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  const handleModelFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      setModelError('Please select a .glb or .gltf file.');
      return;
    }

    if (!isAdmin) {
      setModelError('Only admins can upload models.');
      return;
    }

    setModelError(null);

    try {
      // Upload model to backend so it becomes available to all users
      const { data } = await updateProduct(productId, { model: file });
      setProduct(data);
      setModelUrl(data.modelUrl || null);
    } catch (err) {
      setModelError(err.response?.data?.message || err.message);
    }
  };

  const handleViewInAR = () => {
    if (!modelUrl) {
      setModelError('Upload a GLB/GLTF model first to use AR.');
      return;
    }

    if (modelViewerRef.current?.activateAR) {
      modelViewerRef.current.activateAR();
      return;
    }

    // Fallback: open model in a new tab (useful on desktop or unsupported environments)
    window.open(modelUrl, '_blank');
  };

  const arButtonDisabled = !isMobile;
  const arButtonTitle = isMobile
    ? 'Tap to place the model in your room (AR)'
    : 'View in AR on a mobile device (Android/iOS)';

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!product) return <Message variant="info">Product not found</Message>;

  return (
    <>
      <Helmet>
        <title>AR View - {product.name}</title>
      </Helmet>

      <Container fluid className="p-0">
        <div className="ar-viewer d-flex flex-column flex-lg-row">
          <div className="ar-sidebar p-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1">{product.name}</h4>
                <p className="mb-0">Price: ₹{product.price}</p>
              </div>
              <Button
                variant="primary"
                onClick={toggleFullscreen}
                className="ms-2"
              >
                {fullscreen ? <FaCompress /> : <FaExpand />} {fullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>

            <div className="mb-3">
              <label className={`btn btn-outline-secondary d-inline-flex align-items-center ${!isAdmin ? 'disabled' : ''}`}>
                Choose GLB/Gltf
                <input
                  type="file"
                  accept=".glb,.gltf"
                  hidden
                  onChange={handleModelFile}
                  disabled={!isAdmin}
                />
              </label>
              {modelError && <div className="text-danger mt-2">{modelError}</div>}
            </div>

            {!modelUrl ? (
              <div className="text-muted small mb-3">
                {isAdmin
                  ? 'Upload a GLB/GLTF model to preview it and enable AR for all users.'
                  : 'No model available yet. Ask an admin to upload a GLB/GLTF to enable AR.'}
              </div>
            ) : (
              <div className="text-muted small mb-3">
                {isMobile
                  ? '📱 AR is loading automatically...'
                  : isAdmin
                  ? 'Model is loaded. You can upload a new model to replace it.'
                  : 'Model is loaded. You can inspect it below.'}
              </div>
            )}

            {!isMobile && (
              <Button
                variant="info"
                className="mb-3"
                onClick={handleViewInAR}
                disabled={!modelUrl}
                title={modelUrl ? 'Open AR on mobile device' : 'Upload a model first to enable AR.'}
              >
                View in AR
              </Button>
            )}

            {isAdmin ? (
              <Message variant="info" className="mt-3">
                As an admin, you can upload a new model to replace the current one.
              </Message>
            ) : (
              <Message variant="info" className="mt-3">
                Only admins can change the model. You can still view and inspect it.
              </Message>
            )}

            {!modelUrl ? (
              <Message variant="warning" className="mt-3">
                Upload a GLB/GLTF model and open this page on a mobile device to use AR mode (Scene Viewer / Quick Look).
              </Message>
            ) : isMobile ? (
              <Message variant="info" className="mt-3">
                Tap "View in AR" to place the model in your room.
              </Message>
            ) : (
              <Message variant="info" className="mt-3">
                Model loaded — use mouse drag/scroll to inspect. On mobile, tap "View in AR".
              </Message>
            )}

            {isMobile && arChecked && !arSupported && (
              <Message variant="info" className="mt-3">
                WebXR isn't supported in your browser; tapping "View in AR" will use Scene Viewer / Quick Look instead.
              </Message>
            )}

            {/* Hidden model-viewer element used for mobile AR */}
            {modelUrl && (
              <model-viewer
                ref={modelViewerRef}
                src={modelUrl}
                alt={product.name}
                ar
                ar-modes="scene-viewer quick-look webxr"
                ar-scale="fixed"
                ar-placement="wall"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                exposure="1"
                environment-image="neutral"
                style={{ width: 0, height: 0, position: 'absolute', left: -9999 }}
              />
            )}
          </div>

          {!isMobile && (
            <div className="ar-canvas flex-grow-1">
              <div className="ar-container" style={{ height: '80vh', width: '100%' }}>
                <Canvas
                  camera={{ position: [0, 2, 5], fov: 55 }}
                  style={{ width: '100%', height: '100%', touchAction: 'none' }}
                  gl={{ antialias: true }}
                >
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 10, 5]} intensity={1} />

                  <Suspense fallback={null}>
                    {modelUrl ? (
                      <Model url={modelUrl} />
                    ) : (
                      <mesh position={[0, 0.5, 0]}>
                        <boxGeometry args={[3, 3, 3]} />
                        <meshStandardMaterial color="#007bff" />
                      </mesh>
                    )}
                    <Environment preset="neutral" />
                  </Suspense>

                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                </Canvas>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default ARViewerPage;