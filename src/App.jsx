import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>SurplusMatch</h1>

      <Login />

      <hr style={{ margin: "20px 0" }} />

      <Register />
    </div>
  );
}

export default App;