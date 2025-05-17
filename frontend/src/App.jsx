import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import './App.css';
import Login from './Login.jsx';
import UniversityList from "./UniversityList";
import Register from './Register.jsx';
import FrontPage from './FrontPage.jsx';
import SAFrontPage from './SAFrontPage.jsx';
import AddEvent from './addEvent.jsx';
import RSORequest from './RSOrequest.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import Header from './Header.jsx';
import RSOPage from './RSOPage.jsx';
import RSOList from './RSOList.jsx';

import CreateLocation from './CreateLocation.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
          <Routes>

            <Route element={<PublicRoute />}>
              <Route path="/" element={<Navigate to="/login" replace/>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            <Route element={<ProtectedRoute roles={['user', 'admin']} />}>
              <Route path="/universities" element={<UniversityList />} />
              <Route path="/rso-list" element={<RSOList />} /> 
              <Route path="/home" element={<FrontPage />} />
              <Route path="/createRSO" element={<RSORequest />} />
              <Route path="/rso/:rsoID" element={<RSOPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<SAFrontPage />} />
              <Route path="/create-location" element={<CreateLocation />} />

            </Route>
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
