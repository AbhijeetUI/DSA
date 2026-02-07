import "./App.css";
import Posts from "./components/Posts";
import DOMInteraction from "./components/DOMInteraction";
import MuiltiStepForm from "./components/MuiltiStepForm";
import ProductsPage from "./components/ProductsPage";
import AutoComplete from "./components/AutoComplete";

function App() {
  return (
    <>
      <AutoComplete />
      <ProductsPage />
      <MuiltiStepForm />
      <DOMInteraction />
      <Posts />
    </>
  );
}

export default App;
