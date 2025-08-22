import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ReportPageWrapper from "./pages/ReportPageWrapper";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/:reportName" element={<ReportPageWrapper />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
