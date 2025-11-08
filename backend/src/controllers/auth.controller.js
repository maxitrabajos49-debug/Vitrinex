// src/controllers/auth.controller.js
import User from "../models/user.model.js";
import { createAccessToken } from "../libs/jwt.js";

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, nombre de usuario y contraseña son obligatorios." });
    }

    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: "Este correo ya está registrado." });
    }

    const newUser = new User({
      email,
      username,
      password,
      role: "user", // ya no diferenciamos cliente/vendedor
    });

    const userSaved = await newUser.save();

    const token = await createAccessToken({ id: userSaved._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      role: userSaved.role,
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await userFound.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = await createAccessToken({ id: userFound._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
  });
  return res.json({ message: "Sesión cerrada" });
};

// 👇 Esta función se llamará getProfile, como espera auth.routes.js
export const getProfile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);
    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
    });
  } catch (error) {
    console.error("Error en getProfile:", error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};
