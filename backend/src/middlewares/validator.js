export function validateSchema(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      return res
        .status(400)
        .json({ message: err.errors?.[0]?.message || "Datos inválidos" });
    }
  };
}
