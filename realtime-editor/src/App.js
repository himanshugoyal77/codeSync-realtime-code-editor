import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const publishableKey = process.env.REACT_APP_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
      <ClerkProvider publishableKey={publishableKey}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor/:roomId" element={<EditorPage />} />
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </>
  );
}

export default App;
