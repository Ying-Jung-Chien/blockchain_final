import React, { useState } from 'react';
import './index.css';
import SendScore from './Teacher/SendScore';
import ScoreTable from './Student/ScoreTable';
import NavBar from './NavBar';
import { useEffect } from "react";
import { useNavigate  } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [ID, setID] = useState('');
  const [previousValue, setPreviousValue] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === 'false') navigate('/');
    setRole(localStorage.getItem("role"));
    setID(localStorage.getItem("ID"));

    const intervalId = setInterval(() => {
      if (role !== previousValue && role !== null && ID !== null) {
        clearInterval(intervalId);
      } else {
        window.location.reload();
      }
    }, 1000);

    return () => {
      clearInterval(intervalId); // 组件卸载时清除定时器
    };
  }, [role]);

  const handleLogout = () => {
    console.log('Logout');
    localStorage.clear();
    navigate('/logout');
  };


  if (role === 'teacher') {
    return (
      <div>
        <NavBar handleLogout={handleLogout} id={ID} role={'Teacher'} />
        <SendScore />
      </div>
    );
  } else if (role === 'student') {
    return (
      <div>
        <NavBar handleLogout={handleLogout} id={ID} role={'Student'} />
        <ScoreTable />
      </div>
    );
  } else {
    return (
      <h1 style={{ display: 'flex', justifyContent: 'center' }}>
        Loading...
      </h1>
    );
  }
}

export default Home;