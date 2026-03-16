import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);

  return userInfo && userInfo.role === 'admin' ? children : <Navigate to="/login" />;
};

export default AdminRoute;