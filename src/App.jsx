import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import PatientDashboard from "./Patients/PatientDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import DoctorDashboard from "./Pages/DoctorDashboard";
import DoctorAvailability from "./Pages/DoctorAvailability";
import SearchDoctors from "./Pages/SearchDoctors";
import NearbyDoctors from "./Pages/NearbyDoctors";
import BookAppointment from "./Pages/BookAppointment";
import DoctorDetails from "./Pages/DoctorDetails";
import MyAppointments from "./Pages/MyAppointments";
import DoctorAppointments from "./Pages/DoctorAppointments";
import DoctorVerification from "./Pages/DoctorVerification";
import AdminUserManagement from "./Pages/AdminUserManagement";
import AdminEmergencyCases from "./Pages/AdminEmergencyCases";
import AdminReports from "./Pages/AdminReports";
import AdminAppointments from "./Pages/AdminAppointments";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Departments from "./Pages/Departments";
import PatientChat from "./Pages/PatientChat";
import DoctorChat from "./Pages/DoctorChat";
import PaymentReturn from "./Pages/PaymentReturn";
import MockKhaltiPayment from "./Pages/MockKhaltiPayment";



function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/search-doctors" element={<SearchDoctors />} />
          <Route path="/nearby-doctors" element={<NearbyDoctors />} />

          {/* Protected Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/chat"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/availability"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorAvailability />
              </ProtectedRoute>
            }
          />

          {/* Patient Features */}
          <Route
            path="/search-doctors"
            element={
              <ProtectedRoute requiredRole="patient">
                <SearchDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment/:doctorId"
            element={
              <ProtectedRoute requiredRole="patient">
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-details/:doctorId"
            element={
              <ProtectedRoute requiredRole="patient">
                <DoctorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/chat"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute requiredRole="patient">
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/return"
            element={
              <ProtectedRoute requiredRole="patient">
                <PaymentReturn />
              </ProtectedRoute>
            }
          />
          {/* Mock Khalti page — active only when KHALTI_TEST=true in backend */}
          <Route path="/payment/mock-khalti" element={<MockKhaltiPayment />} />
          <Route
            path="/admin/verify-doctors"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/emergency-cases"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminEmergencyCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>
      <Footer />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
