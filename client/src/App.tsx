/** Study Momentum direction: keep the app shell limited to the welcome route; unknown paths load a tiny fallback only when needed. */
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return <ErrorBoundary>{path === "/" ? <Home /> : <Suspense fallback={null}><NotFound /></Suspense>}</ErrorBoundary>;
}

export default App;
