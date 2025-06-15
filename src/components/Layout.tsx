import React, { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavBar />
      <main style={{ minHeight: "calc(100vh - 160px)" }}>
        {/* Ajuste de altura para empurrar o footer para baixo */}
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
