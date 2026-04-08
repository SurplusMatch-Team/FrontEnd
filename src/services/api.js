import axios from "axios";

const API = axios.create({
  baseURL: "https://contemptibly-septemviral-apollo.ngrok-free.dev/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;