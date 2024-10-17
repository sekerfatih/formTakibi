"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../lib/db";
import Personel from "../models/Personel"; // Import Mongoose model

// Connect to database using Mongoose
await connectToDatabase();

export async function loginUser(username, password) {
  try {
    // Find user using Mongoose
    const user = await Personel.findOne({ username });

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Şifre hatalı" };
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token in cookies
    cookies().set({
      name: "token",
      value: token,
      httpOnly: false, // Important for security
      maxAge: 60 * 60, // 1 hour
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.ad,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login Error: ", error);
    return { success: false, message: "Bir hata oluştu" };
  }
}

export async function logoutUser() {
  try {
    cookies().set({
      name: "token",
      value: "",
      maxAge: -1,
      path: "/",
    });
    return { success: true };
  } catch (error) {
    console.error("Logout Error: ", error);
    return { success: false, message: "Çıkış yapılamadı" };
  }
}

export async function registerUser(data) {
  const { ad, soyad, sicil, mail, username, password, role } = data;

  try {
    // Check if user already exists
    const existingUser = await Personel.findOne({ username });
    const existingMail = await Personel.findOne({ mail });
    const existingSicil = await Personel.findOne({ sicil });

    if (existingUser) {
      return { success: false, message: "Kullanıcı adı zaten alınmış." };
    }
    if (existingMail) {
      return { success: false, message: "Mail zaten alınmış." };
    }
    if (existingSicil) {
      return { success: false, message: "Sicil numarası zaten alınmış." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user using Mongoose
    const newUser = new Personel({
      ad,
      soyad,
      sicil,
      mail,
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Sunucu hatası." };
  }
}
