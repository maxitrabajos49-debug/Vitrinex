import Task from "../models/task.model.js";

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(tasks);
};

export const getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
  if (!task) return res.status(404).json({ message: "No encontrado" });
  res.json(task);
};

export const createTask = async (req, res) => {
  const { title, description, price, type } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const task = await Task.create({
    owner: req.user.id,
    title,
    description,
    type: type || "product",
    price: price ? Number(price) : undefined,
    imageUrl,
  });

  res.status(201).json(task);
};

export const updateTask = async (req, res) => {
  const { title, description, price, type } = req.body;
  const update = { title, description, type, price: price ? Number(price) : undefined };
  if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    update,
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "No encontrado" });
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!task) return res.status(404).json({ message: "No encontrado" });
  res.json({ ok: true });
};
