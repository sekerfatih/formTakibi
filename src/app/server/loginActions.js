"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../lib/db";

export async function loginUser(username, password) {
  const { db } = await connectToDatabase();

  try {
    const user = await db.collection("personel").findOne({ username });
    console.log("user", user);
    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("isPasswordValid", isPasswordValid);

    if (!isPasswordValid) {
      return { success: false, message: "Şifre hatalı" };
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    cookies().set({
      name: "token",
      value: token,
      httpOnly: false,
      maxAge: 60 * 60,
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
    console.log("Login Error: ", error);
    return { success: false, message: "Bir hata oluştuuuuu" };
  }
}

export async function logoutUser() {
  const cookieStore = cookies();
  cookieStore.set({
    name: "token",
    value: "",
    maxAge: -1,
    path: "/",
  });
}

export async function registerUser(data) {
  const { ad, soyad, sicil, mail, username, password, role } = data;
  const { db } = await connectToDatabase();

  try {
    const existingUser = await db.collection("personel").findOne({ username });
    const existingMail = await db.collection("personel").findOne({ mail });
    const existingSicil = await db.collection("personel").findOne({ sicil });

    if (existingUser) {
      return { success: false, message: "Kullanıcı adı zaten alınmış." };
    }
    if (existingMail) {
      return { success: false, message: "Mail zaten alınmış." };
    }
    if (existingSicil) {
      return { success: false, message: "Sicil numarası zaten alınmış." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("personel").insertOne({
      ad,
      soyad,
      sicil,
      mail,
      username,
      password: hashedPassword,
      role,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Sunucu hatası." };
  }
}
