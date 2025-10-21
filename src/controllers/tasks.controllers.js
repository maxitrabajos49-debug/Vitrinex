import Task from "../models/task.model.js";

// GET /api/tasks  -> lista SOLO las tareas del usuario autenticado
export const getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 })
  .populate('user');
  return res.json(tasks);
};

// POST /api/tasks -> crea tarea y la asocia al usuario autenticado
export const createTask = async (req, res) => {
  try {
    // Si no hay userId, faltó el token o es inválido
    if (!req.userId) {
      return res.status(401).json({ message: "No token, unauthorized" });
    }

    const { title, description, date } = req.body;

    const savedTask = await new Task({
      title,
      description,
      date,          // opcional: si no viene, el schema usa Date.now
      user: req.userId,  // 👈 CORRECTO: usar req.userId (no req.user.id)
    }).save();

    return res.json(savedTask);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al crear la tarea" });
  }
};

// GET /api/tasks/:id
export const getTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('user');
  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json(task);
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json(task);
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json({ message: "Task deleted" });
};
