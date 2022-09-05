import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TitleBar from "./components/primitives/TitleBar";
import "./App.css";
import EnterApiKeyScreen from "./components/screens/ApiKey";
import WaitingForConnectionScreen from "./components/screens/Connecting";
import WelcomeScreen from "./components/screens/Welcome";
import GroupListScreen from "./components/screens/Group/List";
import GroupViewScreen from "./components/screens/Group/View";
import GroupFormScreen from "./components/screens/Group/Form";
import GroupLeaderboardScreen from "./components/screens/Group/Leaderboard";
import { Provider as ConnectionProvider } from "./components/hooks/useConnection";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <TitleBar />
        <div className="flex-1 overflow-y-auto">
          <Router initialEntries={["/welcome"]}>
            <InnerApp />
          </Router>
        </div>
      </ConnectionProvider>
    </QueryClientProvider>
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
