import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { useAuth } from "./contexts/AuthContext";
import Home from "./components/home";
import LoginPage from "./components/auth/LoginPage";
import Dashboard from "./components/dashboard/Dashboard";
import PropertyRegistration from "./components/property/PropertyRegistration";
import PropertyEnvironments from "./components/property/PropertyEnvironments";
import RoomInspection from "./components/inspection/RoomInspection";
import InspectionSummary from "./components/inspection/InspectionSummary";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function App() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <ErrorBoundary className="static">
      <Routes>
        <Route path="/" element={<Home onGetStarted={handleGetStarted} />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/new-inspection"
          element={
            <PrivateRoute>
              <PropertyRegistration />
            </PrivateRoute>
          }
        />
        <Route
          path="/property-environments"
          element={
            <PrivateRoute>
              <PropertyEnvironments />
            </PrivateRoute>
          }
        />
        <Route
          path="/room-inspection/:roomId"
          element={
            <PrivateRoute>
              <RoomInspection />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspection-summary"
          element={
            <PrivateRoute>
              <InspectionSummary />
            </PrivateRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
