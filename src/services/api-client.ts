import axios from "axios";

export default axios.create({
  baseURL: "https://api.rawg.io/api",
  params: {
    key: "80ba0519f12a4d1bb3c2575caacec7d7",
  },
});
