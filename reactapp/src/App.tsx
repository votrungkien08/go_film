import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route   } from 'react-router-dom';

import Header from './components/Header';
import MainLayout from './layout/MainLayout';
import Footer from './components/Footer';
import Nominate from './pages/Nominate';
function App() {

  
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<MainLayout/>}>
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
