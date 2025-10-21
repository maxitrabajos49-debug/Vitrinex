export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body); // lanza si es inválido
    next();
  } catch (e) {
    // Devuelve mensajes CLAROS al front
    const errors = e.errors?.map((err) => {
      // si definiste message en zod, úsalo; si no, coge path + message
      return err.message || `${err.path?.join(".")}: ${err.message}`;
    }) || ["Datos inválidos"];

    return res.status(400).json(errors);
  }
};
