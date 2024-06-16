const express = require("express");
const app = express();
const port = 3000;
const API_KEY = "EXAMPLE_API_KEY";
app.use(express.json());

app.post("/send", (req, res) => {
  const { apiKey, user, message } = req.body;
  if (apiKey !== API_KEY) {
    console.log("Unauthorized request, invalid API key");
    return res.status(401).send("Unauthorized");
  }
  console.log(`Sending message from ${user}: ${message}`);
  res.send(`${user}: ${message}`);
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
