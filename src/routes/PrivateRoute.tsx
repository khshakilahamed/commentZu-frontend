
import { Navigate, useLocation } from "react-router";
import type { ReactNode, FC } from "react";
import { useAuth } from "@/hooks/useAuth";

// Define the props for PrivateRoute
interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const { pathname } = useLocation();
  const {isAuthenticated} = useAuth();
  /* const { isLoading, user } = useSelector((state) => state.auth);

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

   */

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ path: pathname }} />;
  }

  return children;
};

export default PrivateRoute;