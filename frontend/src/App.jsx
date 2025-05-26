import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom'
import './App.css'
import Home from './pages/Home/Home'
 
 

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/dashboard" element={<Home/> }/> 
           
        </Routes>
      </Router>
    </>
  )
}

export default App
