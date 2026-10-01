import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";
import { STATUS_CODES, OTP_PURPOSES } from "../utils/constants.js";
import generateOTP from "../utils/generateOTP.js";
import sendMail from "../utils/sendMail.js";
import otpEmailTemplate from "../templates/otpEmailTemplate.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { addMinutesToCurrentDate } from "../utils/helpers.js";
import config from "../config/index.js";
import pool from "../config/database.js";

class AuthService {
  async checkResendLimit(email, purpose) {
    const query = `
      SELECT COUNT(*) as count 
      FROM otps 
      WHERE email = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '15 minutes'
    `;
    const { rows } = await pool.query(query, [
      email.toLowerCase().trim(),
      purpose,
    ]);
    const count = parseInt(rows[0]?.count || "0", 10);

    if (count >= config.otp.maxResendLimit) {
      throw new ApiError(
        STATUS_CODES.TOO_MANY_REQUESTS,
        `Maximum OTP resend limit reached. Please try again after 15 minutes.`,
      );
    }
  }

  async register({ firstName, lastName, email, mobileNumber }) {
    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ApiError(
          STATUS_CODES.CONFLICT,
          "Email is already registered. Please login.",
        );
      }

      const updateQuery = `
        UPDATE users
        SET first_name = $1, last_name = $2, mobile_number = $3, updated_at = CURRENT_TIMESTAMP
        WHERE email = $4
      `;
      await pool.query(updateQuery, [
        firstName.trim(),
        lastName.trim(),
        mobileNumber.trim(),
        email.toLowerCase().trim(),
      ]);
    } else {
      await userModel.create({
        firstName,
        lastName,
        email,
        mobileNumber,
        isVerified: false,
      });
    }

    await this.checkResendLimit(email, OTP_PURPOSES.REGISTER);

    await otpModel.invalidateOTP(email, OTP_PURPOSES.REGISTER);

    const otp = generateOTP();
    const expiresAt = addMinutesToCurrentDate(config.otp.expiryMinutes);
    await otpModel.create({
      email,
      otp,
      purpose: OTP_PURPOSES.REGISTER,
      expiresAt,
    });
    console.log("OTP : ", otp);
    const emailHtml = otpEmailTemplate(
      `${firstName} ${lastName}`,
      otp,
      OTP_PURPOSES.REGISTER,
      config.otp.expiryMinutes,
    );
    await sendMail({
      to: email,
      subject: "Verify Your Stock Market Registration OTP",
      html: emailHtml,
    });

    return {
      email,
      message: "Registration OTP sent successfully. Please check your email.",
    };
  }

  async verifyRegisterOtp({ email, otp }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        "User registration record not found.",
      );
    }
    if (user.isVerified) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Email is already verified.",
      );
    }

    const otpRecord = await otpModel.findValidOTP(email, OTP_PURPOSES.REGISTER);
    if (!otpRecord) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Invalid or expired OTP. Please request a new one.",
      );
    }

    if (otpRecord.attempts >= 3) {
      await otpModel.invalidateOTP(email, OTP_PURPOSES.REGISTER);
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Too many failed attempts. Please request a new OTP.",
      );
    }

    if (otpRecord.otp !== otp) {
      await otpModel.incrementAttempts(otpRecord.id);
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Incorrect OTP. Please try again.",
      );
    }

    const verifiedUser = await userModel.verifyUser(email);
    const accessToken = generateAccessToken({
      id: verifiedUser.id,
      role: verifiedUser.role,
    });
    const refreshToken = generateRefreshToken({ id: verifiedUser.id });

    await userModel.updateRefreshToken(verifiedUser.id, refreshToken);

    await otpModel.invalidateOTP(email, OTP_PURPOSES.REGISTER);

    return {
      user: verifiedUser,
      accessToken,
      refreshToken,
    };
  }

  async login({ email }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        "No account found with this email. Please register first.",
      );
    }

    if (!user.isVerified) {
      throw new ApiError(
        STATUS_CODES.FORBIDDEN,
        "Email is not verified. Please register to verify email.",
      );
    }

    await this.checkResendLimit(email, OTP_PURPOSES.LOGIN);

    await otpModel.invalidateOTP(email, OTP_PURPOSES.LOGIN);

    const otp = generateOTP();
    const expiresAt = addMinutesToCurrentDate(config.otp.expiryMinutes);
    await otpModel.create({
      email,
      otp,
      purpose: OTP_PURPOSES.LOGIN,
      expiresAt,
    });
    console.log("OTP : ", otp);
    const emailHtml = otpEmailTemplate(
      `${user.firstName} ${user.lastName}`,
      otp,
      OTP_PURPOSES.LOGIN,
      config.otp.expiryMinutes,
    );
    await sendMail({
      to: email,
      subject: "Verify Your Stock Market Login OTP",
      html: emailHtml,
    });

    return {
      email,
      message: "Login OTP sent to your email. Please verify to sign in.",
    };
  }


  async verifyLoginOtp({ email, otp }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found.");
    }

    const otpRecord = await otpModel.findValidOTP(email, OTP_PURPOSES.LOGIN);
    if (!otpRecord) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Invalid or expired OTP. Please login again.",
      );
    }

    if (otpRecord.attempts >= 3) {
      await otpModel.invalidateOTP(email, OTP_PURPOSES.LOGIN);
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Too many failed attempts. Please login again.",
      );
    }

    if (otpRecord.otp !== otp) {
      await otpModel.incrementAttempts(otpRecord.id);
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Incorrect OTP. Please try again.",
      );
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await userModel.updateRefreshToken(user.id, refreshToken);

    await otpModel.invalidateOTP(email, OTP_PURPOSES.LOGIN);

    const userDetails = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      isVerified: user.isVerified,
    };

    return {
      user: userDetails,
      accessToken,
      refreshToken,
    };
  }


  async resendOtp({ email, purpose }) {
    const user = await userModel.findByEmail(email);

    if (purpose === OTP_PURPOSES.REGISTER) {
      if (user && user.isVerified) {
        throw new ApiError(
          STATUS_CODES.BAD_REQUEST,
          "Email is already verified. Please login.",
        );
      }
    } else {
      if (!user) {
        throw new ApiError(
          STATUS_CODES.NOT_FOUND,
          "Account not found with this email.",
        );
      }
      if (!user.isVerified) {
        throw new ApiError(
          STATUS_CODES.FORBIDDEN,
          "Email is not verified. Please register first.",
        );
      }
    }

    await this.checkResendLimit(email, purpose);
    await otpModel.invalidateOTP(email, purpose);

    const otp = generateOTP();
    const expiresAt = addMinutesToCurrentDate(config.otp.expiryMinutes);
    await otpModel.create({ email, otp, purpose, expiresAt });

    const name = user ? `${user.firstName} ${user.lastName}` : "Valued User";
    const emailHtml = otpEmailTemplate(
      name,
      otp,
      purpose,
      config.otp.expiryMinutes,
    );

    await sendMail({
      to: email,
      subject: `Resent: Verify Your OTP (${purpose})`,
      html: emailHtml,
    });

    return {
      email,
      message: "A new OTP has been successfully sent to your email.",
    };
  }

  async logout(userId) {
    await userModel.updateRefreshToken(userId, null);
    return {
      message: "Logged out successfully.",
    };
  }


  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "User profile not found.");
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
