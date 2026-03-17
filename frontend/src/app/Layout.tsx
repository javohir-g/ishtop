import { Outlet } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop";

export function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}
