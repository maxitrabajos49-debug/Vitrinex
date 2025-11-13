// backend/src/controllers/auth.controller.js
import User from "../models/user.model.js";
import { createAccessToken } from "../libs/jwt.js";

// 🧾 REGISTRO
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ message: "El correo ya está registrado" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = await createAccessToken({ id: newUser._id });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl || null,
      bio: newUser.bio || "",
      rut: newUser.rut || "",
      phone: newUser.phone || "",
      address: newUser.address || "",
      primaryColor: newUser.primaryColor,
      accentColor: newUser.accentColor,
      bgMode: newUser.bgMode,
      bgColorTop: newUser.bgColorTop,
      bgColorBottom: newUser.bgColorBottom,
      bgPattern: newUser.bgPattern,
      bgImageUrl: newUser.bgImageUrl,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "El correo ya está registrado" });
    }
    return res
      .status(500)
      .json({ message: "Error interno al registrar" });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas" });
    }

    const isMatch = await userFound.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas" });
    }

    const token = await createAccessToken({ id: userFound._id });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      avatarUrl: userFound.avatarUrl || null,
      bio: userFound.bio || "",
      rut: userFound.rut || "",
      phone: userFound.phone || "",
      address: userFound.address || "",
      primaryColor: userFound.primaryColor,
      accentColor: userFound.accentColor,
      bgMode: userFound.bgMode,
      bgColorTop: userFound.bgColorTop,
      bgColorBottom: userFound.bgColorBottom,
      bgPattern: userFound.bgPattern,
      bgImageUrl: userFound.bgImageUrl,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error interno al iniciar sesión" });
  }
};

// 🚪 LOGOUT
export const logout = (_req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.json({ message: "Sesión cerrada" });
};

// 👤 PERFIL PRIVADO (usuario logueado)
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user)
    return res.status(404).json({ message: "Usuario no encontrado" });
  res.json(user);
};

// ✏️ ACTUALIZAR PERFIL (privado)
export const updateProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      avatarUrl,
      bio,
      rut,
      phone,
      address,
      primaryColor,
      accentColor,
      bgMode,
      bgColorTop,
      bgColorBottom,
      bgPattern,
      bgImageUrl,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (username) user.username = username;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== user._id.toString()) {
        return res
          .status(409)
          .json({ message: "Ese correo ya está en uso" });
      }
      user.email = email;
    }

    if (password && password.length >= 6) {
      user.password = password; // el pre('save') la hashea
    }

    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (rut !== undefined) user.rut = rut;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    if (primaryColor !== undefined) user.primaryColor = primaryColor;
    if (accentColor !== undefined) user.accentColor = accentColor;
    if (bgMode !== undefined) user.bgMode = bgMode;
    if (bgColorTop !== undefined) user.bgColorTop = bgColorTop;
    if (bgColorBottom !== undefined) user.bgColorBottom = bgColorBottom;
    if (bgPattern !== undefined) user.bgPattern = bgPattern;
    if (bgImageUrl !== undefined) user.bgImageUrl = bgImageUrl;

    await user.save();

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || "",
      rut: user.rut || "",
      phone: user.phone || "",
      address: user.address || "",
      primaryColor: user.primaryColor,
      accentColor: user.accentColor,
      bgMode: user.bgMode,
      bgColorTop: user.bgColorTop,
      bgColorBottom: user.bgColorBottom,
      bgPattern: user.bgPattern,
      bgImageUrl: user.bgImageUrl,
    });
  } catch (err) {
    console.error("❌ Error al actualizar perfil:", err);
    return res
      .status(500)
      .json({ message: "Error al actualizar el perfil" });
  }
};

// 🌐 PERFIL PÚBLICO (por ID, sin autenticación)
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "username avatarUrl bio primaryColor accentColor bgMode bgColorTop bgColorBottom bgPattern bgImageUrl"
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(user);
  } catch (err) {
    console.error("❌ Error al obtener perfil público:", err);
    return res
      .status(500)
      .json({ message: "Error al obtener el perfil público" });
  }
};
