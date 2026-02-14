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

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "10px", borderBottom: "1px solid black" }}>
        <Link to="/" style={{ marginRight: "20px" }}>
          Autocomplete
        </Link>
        <Link to="/dashboard" style={{ marginRight: "20px" }}>
          Dashboard
        </Link>
        <Link to="/box-coloring-game" style={{ marginRight: "20px" }}>
          Box Coloring Game
        </Link>
        <Link to="/dom-interaction" style={{ marginRight: "20px" }}>
          DOM Interaction
        </Link>
        <Link to="/multistep-form" style={{ marginRight: "20px" }}>
          MultiStep Form
        </Link>
        <Link to="/posts" style={{ marginRight: "20px" }}>
          Posts
        </Link>
        <Link to="/products-page" style={{ marginRight: "20px" }}>
          Products Page
        </Link>
        <Link to="/mortgage-calculator" style={{ marginRight: "20px" }}>
          Mortgage calculator
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<AutoComplete />} />
        <Route path="/box-coloring-game" element={<BoxColoringGame />} />
        <Route path="/dom-interaction" element={<DOMInteraction />} />
        <Route path="/multistep-form" element={<MuiltiStepForm />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/products-page" element={<ProductsPage />} />
        <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
