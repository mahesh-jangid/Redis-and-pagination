const app = require("./index");

const connect = require("./configs/db");

app.listen(9000, async function () {
  try {
    await connect();
    console.log("listening on port 5000");
  } catch (err) {
    console.error("Error connecting" + err);
  }
});
