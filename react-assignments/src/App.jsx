import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Posts from "./components/Posts";
import DOMInteraction from "./components/DOMInteraction";
import MuiltiStepForm from "./components/MuiltiStepForm";

function App() {
  return (
    <>
      <MuiltiStepForm />
      <DOMInteraction />
      <Posts />
    </>
  );
}

export default App;
