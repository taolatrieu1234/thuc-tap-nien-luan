import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { fetchHealthCheck } from './services/api.js' // (5)



fetchHealthCheck() //(5) Test API
  .then((data) => {
    console.log("%c=== KẾT QUẢ KẾT NỐI BACKEND THÀNH CÔNG ===", "color: #00ff00; font-weight: bold;");
    console.log(data);
  })
  .catch((err) => {
    console.log("%c=== KẾT QUẢ KẾT NỐI BACKEND THẤT BẠI ===", "color: #ff0000; font-weight: bold;");
    console.error(err);
  });




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
