import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import Login from './Login';
import Logout from './Logout';
import Home from './Home';
import SignUp from './SignUp';
import AdminLogin from './Admin/Login';
import AdminHome from './Admin/Home';
// import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


const root = ReactDOM.createRoot(document.getElementById('root'));
localStorage.setItem("authenticated", false);


root.render(
  <Router>
    <Routes>
      <Route element={<Login />} path={'/'}></Route>
      <Route element={<Logout />} path={'/logout'}></Route>
      <Route element={<SignUp />} path={'/sign_up'}></Route>
      <Route element={<Home />} path={'/home'}></Route>
      <Route element={<AdminLogin />} path={'/admin'}></Route>
      <Route element={<AdminHome />} path={'/admin/home'}></Route>
    </Routes>
  </Router>
 
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
