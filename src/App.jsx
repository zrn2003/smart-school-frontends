import { Route, Router, Routes } from 'react-router-dom';
// import './App.css';
import Dashboard from './Component/Dashboard'
import Login from './Component/Login';
import { BrowserRouter } from 'react-router-dom';



function App() {
  

  return (
    <BrowserRouter>
    {/* <Router> */}
      <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>  
    {/* </Router>   */}
    
    </BrowserRouter>
  )
}

export default App
