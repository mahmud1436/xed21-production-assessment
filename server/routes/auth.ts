import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { loginSchema, signupSchema, emailVerificationSchema, googleOAuthSchema, type LoginRequest, type SignupRequest, type EmailVerificationRequest, type GoogleOAuthRequest } from '@shared/schema';
import { generateUserToken, generateAdminToken, AuthRequest, authenticateUser, authenticateAdmin } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { googleAuthService } from '../services/googleAuth';

const router = Router();

// Simple email/password signup without email verification
router.post('/signup', async (req, res) => {
  console.log('[SIGNUP] Signup request received:', req.body);
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors
      });
    }

    const { name, email, password, phone } = validation.data;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      // Return different responses based on email verification status
      if (existingUser.isEmailVerified) {
        return res.status(409).json({
          success: false,
          error: 'Account with this email already exists',
          existingUser: true,
          emailVerified: true,
          showPasswordReset: true
        });
      } else {
        return res.status(409).json({
          success: false,
          error: 'Account with this email exists but is not verified',
          existingUser: true,
          emailVerified: false,
          showResendVerification: true
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log(`[signup] Generated verification token for ${email}: ${verificationToken}`);
    
    // Create user with unverified email
    const user = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      isEmailVerified: false, // Email needs verification
      emailVerificationToken: verificationToken,
      googleId: null,
      profilePicture: null
    });

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }

    console.log(`Verification email sent to: ${email}`);

    res.json({
      success: true,
      message: 'Account created successfully! Please check your email and click the verification link to activate your account.',
      requiresVerification: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        coins: user.coins,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user has password (for regular accounts)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Please sign in with Google or reset your password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email address before logging in'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is suspended'
      });
    }

    // Generate token
    const token = generateUserToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`Verifying email with token: ${token}`);
    
    // Verify the email using the token
    const user = await storage.verifyUserEmail(token);
    
    if (!user) {
      console.log(`Verification failed: No user found with token: ${token}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    console.log(`Email verification successful for user: ${user.email}`);

    // Give welcome bonus coins (500) to the user
    const updatedUser = await storage.updateUserCoins(user.id, 500);
    
    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    // Generate JWT token for the newly verified user
    const authToken = generateUserToken(user);

    // Instead of returning JSON, redirect to a success page with the token as a parameter
    // This allows the frontend to handle the successful verification properly
    const redirectUrl = `${req.protocol}://${req.get('host')}/verification-success?token=${authToken}&verified=true&coins=500`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log(`[resend-verification] Generated new token for ${email}: ${verificationToken}`);
    
    // Update user with new token
    await storage.updateUserEmailVerificationToken(user.id, verificationToken);
    console.log(`[resend-verification] Updated user token in database for ${email}`);

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to resend verification email to:', email);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }

    console.log(`Verification email resent to: ${email}`);

    res.json({
      success: true,
      message: 'Verification email sent successfully! Please check your email and click the verification link.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user profile
router.get('/profile', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    // Find admin user
    const admin = await storage.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate admin token
    const token = generateAdminToken(admin);

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
      success: true,
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get admin profile
router.get('/admin/profile', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const admin = await storage.getAdmin(req.user!.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    const { password: _, ...adminWithoutPassword } = admin;
    res.json({
      success: true,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      const baseUrl = 'https://xed21.com';
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid Verification Link</h2>
            <p>The verification token is missing or invalid.</p>
            <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }

    const user = await storage.verifyUserEmail(token);
    
    if (!user) {
      const baseUrl = 'https://xed21.com';
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
            <p>This verification link is invalid or has already been used.</p>
            <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }

    // Give welcome bonus coins (500) to the user
    const updatedUser = await storage.updateUserCoins(user.id, 500);
    
    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    const baseUrl = 'https://xed21.com';
      
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #059669;">Email Verified Successfully!</h2>
          <p>Your email has been verified and you've received 500 welcome coins! You can now log in to your account.</p>
          <a href="${baseUrl}" style="color: #2563eb; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">Go to Login</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Email verification error:', error);
    const baseUrl = 'https://xed21.com';
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">Verification Failed</h2>
          <p>An error occurred during email verification. Please try again.</p>
          <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await storage.updateUserEmailVerificationToken(user.id, newToken);
    await emailService.sendVerificationEmail(user.email, newToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification email'
    });
  }
});

// Google OAuth initiation
router.get('/google', (req, res) => {
  if (!googleAuthService.isConfigured()) {
    return res.status(501).json({
      success: false,
      error: 'Google OAuth is not configured'
    });
  }
  
  const authUrl = googleAuthService.getAuthUrl();
  res.redirect(authUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.redirect(`https://xed21.com?error=oauth_cancelled`);
    }

    const googleUser = await googleAuthService.exchangeCodeForTokens(code);
    if (!googleUser) {
      return res.redirect(`https://xed21.com?error=oauth_failed`);
    }

    // Check if user already exists
    let user = await storage.getUserByGoogleId(googleUser.id);
    
    if (!user) {
      // Check if email already exists with regular account
      const existingUser = await storage.getUserByEmail(googleUser.email);
      if (existingUser) {
        // Link Google account to existing user
        user = await storage.updateUser(existingUser.id, {
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          isEmailVerified: true // Google emails are pre-verified
        });
      } else {
        // Create new user with Google account
        user = await storage.createUser({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          isEmailVerified: true,
          password: null // No password for Google OAuth users
        });
      }
    }

    if (!user) {
      return res.redirect(`https://xed21.com?error=account_creation_failed`);
    }

    // Generate token
    const token = generateUserToken(user);
    
    // Redirect to frontend with token
    res.redirect(`https://xed21.com?token=${token}&google_auth=success`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`https://xed21.com?error=oauth_error`);
  }
});

// Google OAuth sign-in (for frontend)
router.post('/google-signin', async (req, res) => {
  try {
    const validation = googleOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google user data',
        details: validation.error.errors
      });
    }

    const { email, name, googleId, profilePicture } = validation.data;

    // Check if user already exists
    let user = await storage.getUserByGoogleId(googleId);
    
    if (!user) {
      // Check if email already exists with regular account
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // Link Google account to existing user
        user = await storage.updateUser(existingUser.id, {
          googleId,
          profilePicture,
          isEmailVerified: true
        });
      } else {
        // Create new user with Google account
        user = await storage.createUser({
          name,
          email,
          googleId,
          profilePicture,
          isEmailVerified: true,
          password: null
        });
      }
    }

    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create or update user account'
      });
    }

    // Generate token
    const token = generateUserToken(user);
    
    // Remove sensitive data from response
    const { password: _, emailVerificationToken: __, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Password reset form page (GET)
router.get('/reset-password', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      const baseUrl = 'https://xed21.com';
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid Reset Link</h2>
            <p>The password reset token is missing or invalid.</p>
            <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }

    // Verify token is valid and not expired
    const user = await storage.getUserByPasswordResetToken(token);
    if (!user) {
      const baseUrl = 'https://xed21.com';
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
            <p>This password reset link is invalid or has already been used.</p>
            <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
          </body>
        </html>
      `);
    }

    // Show password reset form
    const baseUrl = 'https://xed21.com';
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Xed21</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 0; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
            margin: 20px;
          }
          .logo { 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .logo h1 { 
            color: #2563eb; 
            font-size: 32px; 
            margin: 0; 
            font-weight: bold; 
          }
          .logo p { 
            color: #6b7280; 
            font-size: 14px; 
            margin: 5px 0 0 0; 
          }
          h2 { 
            color: #1f2937; 
            text-align: center; 
            margin-bottom: 20px; 
          }
          .form-group { 
            margin-bottom: 20px; 
          }
          label { 
            display: block; 
            margin-bottom: 5px; 
            color: #374151; 
            font-weight: 500; 
          }
          input[type="password"] { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e5e7eb; 
            border-radius: 6px; 
            font-size: 16px; 
            box-sizing: border-box;
            transition: border-color 0.3s;
          }
          input[type="password"]:focus { 
            outline: none; 
            border-color: #2563eb; 
          }
          .btn { 
            width: 100%; 
            padding: 12px; 
            background: linear-gradient(135deg, #2563eb, #7c3aed); 
            color: white; 
            border: none; 
            border-radius: 6px; 
            font-size: 16px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: transform 0.2s;
          }
          .btn:hover { 
            transform: translateY(-1px); 
          }
          .btn:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
            transform: none; 
          }
          .error { 
            color: #dc2626; 
            font-size: 14px; 
            margin-top: 5px; 
            display: none; 
          }
          .success { 
            color: #059669; 
            font-size: 14px; 
            margin-top: 10px; 
            display: none; 
          }
          .back-link { 
            text-align: center; 
            margin-top: 20px; 
          }
          .back-link a { 
            color: #2563eb; 
            text-decoration: none; 
            font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>Xed21</h1>
            <p>AI-Powered Education Platform</p>
          </div>
          
          <h2>Reset Your Password</h2>
          
          <form id="resetForm">
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input type="password" id="newPassword" name="newPassword" required minlength="6" 
                     placeholder="Enter your new password">
              <div class="error" id="passwordError"></div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required 
                     placeholder="Confirm your new password">
              <div class="error" id="confirmError"></div>
            </div>
            
            <button type="submit" class="btn" id="submitBtn">Reset Password</button>
            
            <div class="error" id="formError"></div>
            <div class="success" id="formSuccess"></div>
          </form>
          
          <div class="back-link">
            <a href="${baseUrl}">← Back to Home</a>
          </div>
        </div>

        <script>
          const form = document.getElementById('resetForm');
          const submitBtn = document.getElementById('submitBtn');
          const passwordInput = document.getElementById('newPassword');
          const confirmInput = document.getElementById('confirmPassword');
          const passwordError = document.getElementById('passwordError');
          const confirmError = document.getElementById('confirmError');
          const formError = document.getElementById('formError');
          const formSuccess = document.getElementById('formSuccess');

          function hideErrors() {
            passwordError.style.display = 'none';
            confirmError.style.display = 'none';
            formError.style.display = 'none';
            formSuccess.style.display = 'none';
          }

          function showError(element, message) {
            element.textContent = message;
            element.style.display = 'block';
          }

          function validatePassword() {
            const password = passwordInput.value;
            if (password.length < 6) {
              showError(passwordError, 'Password must be at least 6 characters long');
              return false;
            }
            passwordError.style.display = 'none';
            return true;
          }

          function validateConfirm() {
            const password = passwordInput.value;
            const confirm = confirmInput.value;
            if (password !== confirm) {
              showError(confirmError, 'Passwords do not match');
              return false;
            }
            confirmError.style.display = 'none';
            return true;
          }

          passwordInput.addEventListener('input', validatePassword);
          confirmInput.addEventListener('input', validateConfirm);

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideErrors();

            if (!validatePassword() || !validateConfirm()) {
              return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';

            try {
              const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: '${token}',
                  newPassword: passwordInput.value
                })
              });

              const result = await response.json();

              if (result.success) {
                formSuccess.textContent = result.message;
                formSuccess.style.display = 'block';
                form.style.display = 'none';
                setTimeout(() => {
                  window.location.href = '${baseUrl}';
                }, 3000);
              } else {
                showError(formError, result.error || 'Password reset failed');
              }
            } catch (error) {
              showError(formError, 'Network error. Please try again.');
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Reset Password';
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Password reset page error:', error);
    const baseUrl = 'https://xed21.com';
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">Reset Failed</h2>
          <p>An error occurred while loading the reset page. Please try again.</p>
          <a href="${baseUrl}" style="color: #2563eb;">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate password reset token (expires in 1 hour)
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await storage.setPasswordResetToken(user.id, resetToken, expiresAt);

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

    if (emailSent) {
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send reset email. Please try again.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find user by reset token (also checks if token is not expired)
    const user = await storage.getUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    const updatedUser = await storage.resetUserPassword(user.id, hashedPassword);

    if (updatedUser) {
      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to reset password. Please try again.'
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test email endpoint (for development/testing only)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Generate a test verification token
    const testToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email, testToken);
    
    if (emailSent) {
      res.json({
        success: true,
        message: `Test verification email sent to ${email}`,
        testToken: testToken
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;