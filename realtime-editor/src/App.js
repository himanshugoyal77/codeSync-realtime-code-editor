import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: "#4aee88",
              },
            },
          }}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
