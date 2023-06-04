import React, { useState } from 'react';
// import ReactDOM from 'react-dom/client';
import './index.css';
import SendScore from './Teacher/SendScore';
import ScoreTable from './Student/ScoreTable';
import Review from './Review';
import { useEffect } from "react";
import { useNavigate  } from 'react-router-dom';



const NavBar = ({ handleLogout, id, role }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#721f6e',
      }}
    >
      <div style={{ marginLeft: '10px', color: 'white' }}>{role} Home</div>
      <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ marginRight: '10px', color: 'white' }}>Hi, {id}</div>
        <button
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            margin: '10px',
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default NavBar;