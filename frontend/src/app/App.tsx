import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <LanguageProvider>
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}