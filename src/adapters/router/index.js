import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom';

// This file is the boundary, so re-exporting the components directly is fine.
export { BrowserRouter, Routes, Route, Navigate, Outlet, Link };

export const useNavigation = () => {
  const navigate = useNavigate();
  return {
    goTo: (path, state = null) => navigate(path, ...(state ? [{ state }] : [])),
    goBack: () => navigate(-1),
    replace: (path, state = null) => navigate(path, { replace: true, ...(state ? { state } : {}) }),
  };
};

export const useRouteParams = () => useParams();

export const useRouteLocation = () => {
  const location = useLocation();
  return { path: location.pathname, search: location.search, state: location.state, hash: location.hash };
};

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  return {
    get: (key) => searchParams.get(key),
    set: (key, value) => setSearchParams({ [key]: value }),
  };
};
