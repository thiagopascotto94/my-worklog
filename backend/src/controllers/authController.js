const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, RootUser, EmailVerificationToken } = require('../models');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please provide email, password, first name, and last name.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.email_confirmed) {
      return res.status(401).json({
        message: 'Email not verified.',
        verificationRequired: true,
        email: user.email,
      });
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

const rootLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const rootUser = await RootUser.findOne({ where: { email } });
    if (!rootUser) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, rootUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const accessToken = jwt.sign({ userId: rootUser.id, isRoot: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: rootUser.id, isRoot: true }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error during root login.', error: error.message });
  }
};

const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Invalidate previous tokens
    await EmailVerificationToken.destroy({ where: { userId: user.id } });

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Verification code for ${email}: ${code}`); // Simulate sending email

    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await EmailVerificationToken.create({
      userId: user.id,
      token: hashedCode,
      expiresAt,
    });

    res.status(200).json({ message: 'Verification code sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while sending verification code.', error: error.message });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const verificationToken = await EmailVerificationToken.findOne({
      where: { userId: user.id },
    });

    if (!verificationToken) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(code, verificationToken.token);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (new Date() > new Date(verificationToken.expiresAt)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    user.email_confirmed = true;
    await user.save();

    await EmailVerificationToken.destroy({ where: { userId: user.id } });

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error during code verification.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  rootLogin,
  sendVerificationCode,
  verifyCode,
};
