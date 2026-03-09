import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updateProfileImage,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/profile-image', upload.single('profileImage'), updateProfileImage);
router.put('/password', updatePassword);

export default router;
