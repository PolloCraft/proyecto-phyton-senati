import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <Toast />
    </ErrorBoundary>
  );
}

export default App;
