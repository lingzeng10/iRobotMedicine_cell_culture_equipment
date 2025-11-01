import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppMUI from './AppMUI';
import AOIPage from './pages/AOIPage';
import TicketPhotoPage from './pages/TicketPhotoPage'; // 新增

/**
 * 主路由組件
 * 管理應用程式的路由導航
 */
const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 主應用程式路由 */}
        <Route path="/" element={<AppMUI />} />
        
        {/* AOI 照片上傳頁面 */}
        <Route path="/aoi-photos" element={<AOIPage />} />
        
        {/* 工單照片頁面 - 動態路由 */}
        <Route path="/ticket/:ticketId/photos" element={<TicketPhotoPage />} />
        
        {/* 預設重定向到主頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
