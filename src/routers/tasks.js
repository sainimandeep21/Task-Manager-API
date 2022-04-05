const express = require("express");
const task = require("../models/tasks");
const auth = require("../middlewares/auth");
const User = require("../models/users");
const router = new express.Router();
// GET /tasks?completed=true
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    const task1 = await req.user.populate([
      {
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      },
    ]);
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/tasks", auth, async (req, res) => {
  const task1 = new task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task1.save();
    res.status(201).send(task1);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task1 = await task.findOne({ _id, owner: req.user._id });
    if (!task1) {
      return res.status(404).send();
    }
    res.send(task1);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task1 = await task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task1) {
      return res.status(404).send();
    }
    res.send(task1);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates!" });
  }

  try {
    const task1 = await task.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!task1) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task1[update] = req.body[update]));
    await task1.save();
    res.send(task1);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
