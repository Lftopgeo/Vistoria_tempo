import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Menu } from "./components/navigation/Menu";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { useAuth } from "./contexts/AuthContext";
import Home from "./components/home";
import LoginPage from "./components/auth/LoginPage";
import Dashboard from "./components/dashboard/Dashboard";
import PropertyRegistration from "./components/property/PropertyRegistration";
import PropertyEnvironments from "./components/property/PropertyEnvironments";
import RoomInspection from "./components/inspection/RoomInspection";
import InspectionSummary from "./components/inspection/InspectionSummary";
import InspectionReport from "./components/inspection/InspectionReport";
import InspectionAreas from "./components/inspection/InspectionAreas";
import ExternalAreaInspection from "./components/inspection/ExternalAreaInspection";
import KeysInspection from "./components/inspection/KeysInspection";
import MetersInspection from "./components/inspection/MetersInspection";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, loading } = auth;

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

const App: React.FC = () => {
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
      <Menu />
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
          path="/inspection-areas"
          element={
            <PrivateRoute>
              <InspectionAreas />
            </PrivateRoute>
          }
        />
        <Route
          path="/external-area"
          element={
            <PrivateRoute>
              <ExternalAreaInspection />
            </PrivateRoute>
          }
        />
        <Route
          path="/keys-inspection"
          element={
            <PrivateRoute>
              <KeysInspection />
            </PrivateRoute>
          }
        />
        <Route
          path="/meters-inspection"
          element={
            <PrivateRoute>
              <MetersInspection />
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
        <Route
          path="/inspection-report/:inspectionId"
          element={
            <PrivateRoute>
              <InspectionReport />
            </PrivateRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
