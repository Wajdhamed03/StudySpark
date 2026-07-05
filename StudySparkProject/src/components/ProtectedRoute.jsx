import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // تخطي الفحص تماماً وتمرير المستخدم لداخل الصفحات فوراً
  return <Outlet />;
}