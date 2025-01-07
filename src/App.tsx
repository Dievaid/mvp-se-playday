import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage'; // Import your new GamesPage
import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MyFields from './pages/MyFields';
import { AuthProvider } from './components/context/auth-provider';
import { FieldsPage } from './pages/FieldsPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          {/* Always render Header */}
          <Header />
          <Routes>
            {/* Redirect from root to /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Home Page */}
            <Route path="/home" element={<HomePage />} />

            {/* Games Page */}
            <Route path="/games" element={<GamesPage />} />

            {/* About Page */}
            <Route path="/about" element={<AboutPage />} />

            {/* Fields Page */}
            <Route path="/fields" element={<FieldsPage />} />

            {/* My Fields Page */}
            <Route path="/my-fields" element={<MyFields />} />

            {/* Sign In Page */}
            <Route path="/signIn" element={<SignIn />} />

            {/* Sign Up Page */}
            <Route path="/signUp" element={<SignUp />} />

            {/* Fallback for unmatched routes */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
