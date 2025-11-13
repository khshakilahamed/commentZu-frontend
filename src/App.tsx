import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./pages/Login";
import { Toaster } from "./components/ui/sonner";
import SignUp from "./pages/SignUp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <SignUp />,
  },
]);

function App() {
  return (
    <>
      <Toaster position="top-right"/>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
