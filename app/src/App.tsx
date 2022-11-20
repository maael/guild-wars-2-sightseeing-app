import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import TitleBar from "./components/primitives/TitleBar";
import "./App.css";
import EnterApiKeyScreen from "./components/screens/ApiKey";
import GroupListScreen from "./components/screens/Group/List";
import GroupViewScreen from "./components/screens/Group/View";
import GroupFormScreen from "./components/screens/Group/Form";
import GroupLeaderboardScreen from "./components/screens/Group/Leaderboard";
import { Provider as ConnectionProvider } from "./components/hooks/useConnection";
import AboutScreen from "./components/screens/About";
import UserScreen from "./components/screens/User";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      refetchInterval: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <Router initialEntries={["/setup"]}>
          <TitleBar />
          <div id="app" className="flex-1 overflow-y-auto">
            <InnerApp />
          </div>
        </Router>
        <Toaster toastOptions={{ position: "bottom-center" }} />
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

function InnerApp() {
  return (
    <Routes>
      <Route path="/setup" element={<EnterApiKeyScreen />} />
      <Route path="/groups/new" element={<GroupFormScreen />} />
      <Route path="/groups/:id/edit" element={<GroupFormScreen />} />
      <Route
        path="/groups/:id/leaderboard"
        element={<GroupLeaderboardScreen />}
      />
      <Route path="/groups/:id" element={<GroupViewScreen />} />
      <Route path="/groups" element={<GroupListScreen />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/user/:account" element={<UserScreen />} />
    </Routes>
  );
}

export default App;
