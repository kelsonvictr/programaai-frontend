// src/App.tsx
import React from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Courses from "./pages/Courses"
import CourseDetails from "./pages/CourseDetails"
import Inscricao from "./pages/Inscricao"
import CookieBanner from "./components/CookieBanner"
import Admin from "./pages/Admin"
import ListaInteresse from "./pages/Interesse"

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Courses />} />
        <Route path="/cursos/:id" element={<CourseDetails />} />
        <Route path="/inscricao/" element={<Inscricao />} />
        <Route path="/galaxy" element={<Admin />} />
        <Route path="/interesse" element={<ListaInteresse />} />
      </Routes>
      <CookieBanner />
    </Layout>
  )
}

export default App
