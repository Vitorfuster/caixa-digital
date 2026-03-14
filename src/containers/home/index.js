import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();
  // Envia para a página daily enquanto a página home está incompleta!
  useEffect(() => {
    navigate("/daily");
  }, []);

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
