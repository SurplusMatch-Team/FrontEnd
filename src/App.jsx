import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">SurplusMatch</h1>

      {isLogin ? <Login /> : <Register />}

      <p className="text-center text-sm text-gray-600 mt-6">
        {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 font-semibold hover:underline"
        >
          {isLogin ? "Kayıt Ol" : "Giriş Yap"}
        </button>
      </p>
    </div>
  );
}

export default App;