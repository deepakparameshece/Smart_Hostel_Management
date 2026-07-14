const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const { AppError } = require('../../utils/helpers');
const { sendEmail } = require('../../utils/email');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const register = async (userData) => {
  const { email, password, firstName, lastName, role, idType, idNumber, address, city, purpose } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: role || 'STUDENT',
      },
    });

    if (newUser.role === 'STUDENT') {
      await tx.student.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          idType,
          idNumber,
          address,
          city,
          purpose: purpose || 'STUDENT'
        },
      });
    }

    return newUser;
  });

  const { accessToken, refreshToken } = generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName,
      lastName,
    },
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true },
  });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  }).catch(() => {}); // Optional: don't fail login if this fails

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.student ? `${user.student.firstName} ${user.student.lastName}` : (user.role === 'ADMIN' ? 'Admin User' : user.email.split('@')[0]),
      studentId: user.student?.id,
    },
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token) => {
  if (!token) {
    throw new AppError('Refresh token required', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

const resetTokens = new Map(); // key: email, value: { token, expiry }

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('No user found with this email address', 404);
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000;

  resetTokens.set(email, { token, expiry });
  console.log(`\n🔑 [SIMULATED EMAIL] Password reset OTP for ${email}: ${token}\n`);

  let previewUrl = null;
  try {
    const emailResult = await sendEmail({
      to: email,
      subject: 'SmartHostel Password Recovery OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">Password Recovery</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">You requested to recover your password for your SmartHostel account. Use the following 6-digit One-Time Password (OTP) to reset your password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5; background-color: #f5f3ff; padding: 12px 24px; border-radius: 8px; border: 1px solid #ddd6fe;">${token}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This OTP code is valid for <strong>10 minutes</strong>. If you did not make this request, please ignore this email or contact support.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">SmartHostel Management System. All rights reserved.</p>
        </div>
      `,
      text: `Hello, your password recovery OTP code is: ${token}. This code is valid for 10 minutes.`,
    });
    if (emailResult && emailResult.previewUrl) {
      previewUrl = emailResult.previewUrl;
    }
  } catch (error) {
    console.error('Email sending failed. Falling back to log-only.');
  }

  return { 
    message: 'Reset token generated successfully.',
    previewUrl 
  };
};

const resetPassword = async (email, token, newPassword) => {
  const stored = resetTokens.get(email);
  if (!stored) {
    throw new AppError('No password reset requested for this email', 400);
  }

  if (stored.token !== token) {
    throw new AppError('Invalid reset token/OTP code', 400);
  }

  if (Date.now() > stored.expiry) {
    resetTokens.delete(email);
    throw new AppError('Reset token has expired', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  resetTokens.delete(email);
  return { message: 'Password has been reset successfully.' };
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
