import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PageWrapper from './components/Layout/PageWrapper';

// Stub Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BlogList from './pages/Blog/BlogList';
import BlogEditor from './pages/Blog/BlogEditor';
import EventList from './pages/Events/EventList';
import EventEditor from './pages/Events/EventEditor';
import LinkList from './pages/Links/LinkList';
import LinkEditor from './pages/Links/LinkEditor';
import VoterInfoList from './pages/VoterInfo/VoterInfoList';
import VoterInfoEditor from './pages/VoterInfo/VoterInfoEditor';
import UserList from './pages/Users/UserList';
import Settings from './pages/Settings/ChangePassword';

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PageWrapper />}>
            <Route index element={<Dashboard />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/:id" element={<BlogEditor />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/:id" element={<EventEditor />} />
            <Route path="links" element={<LinkList />} />
            <Route path="links/:id" element={<LinkEditor />} />
            <Route path="voter-info" element={<VoterInfoList />} />
            <Route path="voter-info/:id" element={<VoterInfoEditor />} />
            <Route path="users" element={<UserList />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
