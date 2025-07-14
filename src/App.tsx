import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import AddStudent from "./pages/AddStudent";
import Batches from "./pages/Batches";
import TestReports from "./pages/TestReports";
import Attendance from "./pages/Attendance";
import FeeManagement from "./pages/FeeManagement";
import KitManagement from "./pages/KitManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/test-reports" element={<TestReports />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fee-management" element={<FeeManagement />} />
            <Route path="/kit-management" element={<KitManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
