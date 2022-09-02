import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import TitleBar from "./components/TitleBar";
import "./App.css";
import BaseScreen from "./components/BaseScreen";
import EnterApiKeyScreen from "./components/screens/ApiKey";
import WaitingForConnectionScreen from "./components/screens/Connecting";
import WelcomeScreen from "./components/screens/Welcome";
import GroupListScreen from "./components/screens/Group/List";
import GroupViewScreen from "./components/screens/Group/View";
import GroupFormScreen from "./components/screens/Group/Form";
import GroupLeaderboardScreen from "./components/screens/Group/Leaderboard";

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
      <Route path="/groups/new" element={<GroupFormScreen />} />
      <Route path="/groups/:id/edit" element={<GroupFormScreen />} />
      <Route
        path="/groups/:id/leaderboard"
        element={<GroupLeaderboardScreen />}
      />
      <Route path="/groups/:id" element={<GroupViewScreen />} />
      <Route path="/groups" element={<GroupListScreen />} />
    </Routes>
  );
}

export default App;
