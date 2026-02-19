import User from '../models/User.js';
import { sendTokenResponse } from '../utils/jwtToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user
  const normalizedRole = role || 'customer';
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: normalizedRole,
    ownerVerificationStatus: normalizedRole === 'parking_owner' ? 'pending' : 'not_applicable'
  });

  // Send token response
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const loginEmail = (email || '').toLowerCase().trim();
  const fixedAdminEmail = (process.env.ADMIN_LOGIN_EMAIL || '').toLowerCase().trim();
  const fixedAdminPassword = process.env.ADMIN_LOGIN_PASSWORD || '';
  const isFixedAdminLoginAttempt = Boolean(fixedAdminEmail) && loginEmail === fixedAdminEmail;

  // Check for user and include password
  let user = await User.findOne({ email: loginEmail }).select('+password');

  if (isFixedAdminLoginAttempt) {
    if (!fixedAdminPassword) {
      return res.status(500).json({
        success: false,
        message: 'Admin login is not configured correctly.'
      });
    }

    if (password !== fixedAdminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user) {
      user = await User.create({
        name: 'Platform Admin',
        email: loginEmail,
        password: fixedAdminPassword,
        role: 'admin',
        isVerified: true,
        ownerVerificationStatus: 'not_applicable'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin credentials are configured for a non-admin account.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    sendTokenResponse(user, 200, res);
    return;
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No account spotted on SPOT-ON yet. Park yourself on Sign Up and join the ride.'
    });
  }

  // Check if password matches
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const normalizedUserRole = user.role === 'user' ? 'customer' : user.role;
  if (role && normalizedUserRole !== role) {
    return res.status(403).json({
      success: false,
      message: `This account is registered as ${normalizedUserRole}. Please select the correct role.`
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated'
    });
  }

  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user && user.role === 'user') {
    user.role = 'customer';
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (phone) fieldsToUpdate.phone = phone;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update profile image
// @route   PUT /api/auth/profile-image
// @access  Private
export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Profile image file is required'
    });
  }

  const uploadResult = await uploadToCloudinary(req.file.buffer, 'spot-on-parking/profiles');

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profileImage: uploadResult.secure_url },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = asyncHandler(async (req, res) => {
  // User is attached to req by passport
  sendTokenResponse(req.user, 200, res);
});
