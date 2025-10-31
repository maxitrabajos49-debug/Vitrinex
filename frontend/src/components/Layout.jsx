import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        <Outlet />
      </main>
    </>
  );
}
