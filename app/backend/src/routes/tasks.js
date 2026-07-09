import { Router } from 'express';
import Task from '../models/Task.js';
import { validateTask } from '../middleware/validateTask.js';

const router = Router();

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

router.post('/', validateTask, async (req, res) => {
  const task = await Task.create({ title: req.body.title });
  res.status(201).json(task);
});

router.put('/:id', validateTask, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!task) return res.status(404).json({ error: 'task not found' });
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: 'task not found' });
  res.status(204).end();
});

export default router;
