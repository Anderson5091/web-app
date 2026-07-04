import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import SessionExpiredModal from "./components/SessionExpiredModal";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <SessionExpiredModal />
    </>
  );
}
