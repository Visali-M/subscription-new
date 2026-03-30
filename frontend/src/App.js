import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login             from "./pages/Login";
import Signup            from "./pages/Signup";
import Dashboard         from "./pages/Dashboard";
import AddSubscription   from "./pages/AddSubscription";
import EditSubscription  from "./pages/EditSubscription";
import Analytics         from "./pages/Analytics";
import CalendarView      from "./pages/CalendarView";
import PaymentHistory    from "./pages/PaymentHistory";

const PrivateRoute = ({ children }) => {
  const loggedIn = localStorage.getItem("loggedIn");
  return loggedIn ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"       element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add"            element={<PrivateRoute><AddSubscription /></PrivateRoute>} />
        <Route path="/edit/:id"       element={<PrivateRoute><EditSubscription /></PrivateRoute>} />
        <Route path="/analytics"       element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/calendar"        element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        <Route path="/payment-history" element={<PrivateRoute><PaymentHistory /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
