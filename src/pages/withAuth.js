import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const navigate = useNavigate();

    useMemo(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
      } else {
        // Set the token in the headers for authorization
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  // Set display name for the wrapped component
  WithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
};

export default withAuth;
