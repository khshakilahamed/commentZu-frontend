import { RouterProvider } from "react-router/dom";
import { Toaster } from "./components/ui/sonner";
import router from "./routes/Routes";
import { AuthProvider } from "./providers/AuthProvider";


function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right"/>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
