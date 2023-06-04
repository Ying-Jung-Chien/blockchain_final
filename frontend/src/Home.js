import React, { useState } from 'react';
// import ReactDOM from 'react-dom/client';
import './index.css';
import SendScore from './Teacher/SendScore';
import ScoreTable from './Student/ScoreTable';
import Review from './Review';
import { useEffect } from "react";
import { useNavigate  } from 'react-router-dom';


// const root = ReactDOM.createRoot(document.getElementById('root'));

const Home = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === 'false') navigate('/');
    
    setRole(localStorage.getItem("role"))
  }, []);

  const handleLogout = () => {
    console.log('Logout');
    // localStorage.setItem("authenticated", false);
    localStorage.clear();
    navigate('/logout');
  };


  if (localStorage.getItem("role") === 'teacher') {
    return (
      <div>
        <SendScore />
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  } 
  // else if (localStorage.getItem("role") === 'admin') {
  //   return (
  //     <div>
  //       <Review />
  //       <button onClick={handleLogout}>Logout</button>
  //     </div>
  //   );
  // } 
  else {
    return (
      <div>
        <ScoreTable />
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }
}

export default Home;