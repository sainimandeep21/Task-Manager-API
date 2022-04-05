const express = require("express");
require("./db/mongoose");
const User = require("./models/users");
const task = require("./models/tasks");
const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("the server is up on " + port);
});
