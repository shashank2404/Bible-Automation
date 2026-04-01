import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChatPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, []);

  return <h1>Welcome to Bible AI Chat 🚀</h1>;
}

export default ChatPage;