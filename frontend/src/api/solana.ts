import axios from "axios";

const instance = axios.create({
  baseURL: 'http://localhost:3000/solana'
});

export default instance;