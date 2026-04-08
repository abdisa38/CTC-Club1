import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import generateToken, { clearToken } from '../utils/generateToken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hardcode "student" so anonymous public API cannot create admin
  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
  });

  if (user) {
    generateToken(res, user._id.toString(), user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id.toString(), user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  clearToken(res);
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request & { user?: any }, res: Response) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
