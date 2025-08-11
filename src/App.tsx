// src/App.tsx
import React from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Courses from "./pages/Courses"
import CourseDetails from "./pages/CourseDetails"
import Inscricao from "./pages/Inscricao"
import CookieBanner from "./components/CookieBanner"
import Pagamento from "./pages/Pagamento"
import AdminGuard from "./components/AdminGuard"
import Admin from "./pages/Admin"

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Courses />} />
        <Route path="/cursos/:id" element={<CourseDetails />} />
        <Route path="/inscricao/:id" element={<Inscricao />} />
        <Route path="/pagamento/:inscricaoId" element={<Pagamento />} />
        <Route
          path="/_galaxy"
          element={
              <Admin />
            }
        />
      </Routes>
      <CookieBanner />
    </Layout>
  )
}

export default App
