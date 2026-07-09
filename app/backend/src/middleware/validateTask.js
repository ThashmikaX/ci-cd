// Shared validation for POST/PUT so both routes reject bad input the same way.
export function validateTask(req, res, next) {
  const { title } = req.body;
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  next();
}
