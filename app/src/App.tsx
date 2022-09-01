import React from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import TitleBar from "./components/TitleBar";
import "./App.css";
import BaseScreen from "./components/BaseScreen";
import EnterApiKeyScreen from "./components/screens/ApiKey";
import WaitingForConnectionScreen from "./components/screens/Connecting";
import WelcomeScreen from "./components/screens/Welcome";

function App() {
  return (
    <>
      <TitleBar />
      <BaseScreen>
        <Router initialEntries={["/welcome"]}>
          <InnerApp />
        </Router>
      </BaseScreen>
    </>
  );
}

function InnerApp() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/setup" element={<EnterApiKeyScreen />} />
      <Route path="/connected" element={<WaitingForConnectionScreen />} />
    </Routes>
  );
}

export default App;
