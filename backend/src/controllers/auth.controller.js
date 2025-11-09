// src/controllers/auth.controller.js
import User from '../models/user.model.js';
import { createAccessToken } from '../libs/jwt.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son obligatorios' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ message: 'El correo ya está registrado' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = await createAccessToken({ id: newUser._id });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl || null,
      bio: newUser.bio || '',
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: 'El correo ya está registrado' });
    }
    return res
      .status(500)
      .json({ message: 'Error interno al registrar' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res
        .status(401)
        .json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await userFound.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: 'Credenciales inválidas' });
    }

    const token = await createAccessToken({ id: userFound._id });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      avatarUrl: userFound.avatarUrl || null,
      bio: userFound.bio || '',
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error interno al iniciar sesión' });
  }
};

export const logout = (_req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ message: 'Sesión cerrada' });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user)
    return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

// 🔥 Actualizar perfil de usuario (incluye avatar y bio)
export const updateProfile = async (req, res) => {
  try {
    const { username, email, password, avatarUrl, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    if (username) {
      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== user._id.toString()) {
        return res
          .status(409)
          .json({ message: 'Ese correo ya está en uso' });
      }
      user.email = email;
    }

    // Cambiar contraseña (opcional)
    if (password && password.length >= 6) {
      user.password = password; // el pre('save') se encarga de hashearla
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    await user.save();

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || '',
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error al actualizar el perfil' });
  }
};
