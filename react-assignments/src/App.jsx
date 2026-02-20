import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AppRoutes from "./routes/routes";
import "./App.css";
import AutoComplete from "./components/AutoComplete";
import BoxColoringGame from "./components/BoxColoringGame";
import DOMInteraction from "./components/DOMInteraction";
import MuiltiStepForm from "./components/MuiltiStepForm";
import Posts from "./components/Posts";
import ProductsPage from "./components/ProductsPage";
import MortgageCalculator from "./components/MortgageCalculator";
import LikeButton from "./components/LikeButton";
import WindowResize from "./components/WindowResize";
import SmartTable from "./components/SmartTable";

function App() {
  const navLinks = [
    { path: "/", label: "Autocomplete" },
    { path: "/box-coloring-game", label: "Box Coloring Game" },
    { path: "/dom-interaction", label: "DOM Interaction" },
    { path: "/multistep-form", label: "MultiStep Form" },
    { path: "/posts", label: "Posts" },
    { path: "/products-page", label: "Products" },
    { path: "/mortgage-calculator", label: "Mortgage Calculator" },
    { path: "/like-button", label: "Like Button" },
    { path: "/window-resize", label: "Window Resize" },
    { path: "/smart-table", label: "Smart Table" },
  ];
  return (
    <BrowserRouter>
      <nav className="navbar">
        {navLinks.map((link) => (
          <Link key={link.path} to={link.path} className="nav-item">
            {link.label}
          </Link>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<AutoComplete />} />
        <Route path="/smart-table" element={<SmartTable />} />
        <Route path="/box-coloring-game" element={<BoxColoringGame />} />
        <Route path="/dom-interaction" element={<DOMInteraction />} />
        <Route path="/multistep-form" element={<MuiltiStepForm />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/products-page" element={<ProductsPage />} />
        <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
        <Route path="/like-button" element={<LikeButton />} />
        <Route path="/window-resize" element={<WindowResize />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
