import {HashRouter, Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import ConfigurePage from "./pages/ConfigurePage.tsx";
import EnginePage from "./pages/EnginePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Header from "./components/Header.tsx";
import {ActiveRealEstateObjectProvider} from "./contexts/ActiveRealEstateObjectContext.tsx";
import {AuthRedirectProvider} from "./contexts/AuthRedirectContext.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";
import styles from './App.module.css';
import DisfactPage from "./pages/DisfactPage.tsx";

function App() {

  return (
      <div className={styles.globalContainer}>
        <HashRouter>
            <AuthRedirectProvider>
                <AuthProvider>
                    <Header />
                    <ActiveRealEstateObjectProvider>
                        <Routes>
                    <Route path={"/login"} element={<LoginPage />}/>
                    <Route path={"/"} element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }/>
                    <Route path={"/onboarding/:id"} element={
                        <ProtectedRoute>
                            <OnboardingPage />
                        </ProtectedRoute>
                    }/>
                    <Route path={"/configure/:id"} element={
                        <ProtectedRoute>
                            <ConfigurePage />
                        </ProtectedRoute>
                    }/>
                    <Route path={"/engine/:id"} element={
                        <ProtectedRoute>
                            <EnginePage />
                        </ProtectedRoute>
                    }/>
                    <Route path={'/disfact/'} element={
                        <ProtectedRoute>
                            <DisfactPage />
                        </ProtectedRoute>
                    } />
                        </Routes>
                    </ActiveRealEstateObjectProvider>
                </AuthProvider>
            </AuthRedirectProvider>
        </HashRouter>
      </div>
  )
}

export default App
