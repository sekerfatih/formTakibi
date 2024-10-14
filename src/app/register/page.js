"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../server/loginActions";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    sicil: "",
    mail: "",
    username: "",
    password: "",
    role: "user",
  });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validate inputs
    const { ad, soyad, sicil, mail, username, password } = formData;
    if (!ad || !soyad || !sicil || !mail || !username || !password) {
      setFeedback("Lütfen tüm alanları doldurunuz.");
      return;
    }

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(mail)) {
      setFeedback("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    const result = await registerUser(formData);

    if (result.success) {
      setFeedback("Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push("/anasayfa");
      }, 2000);
    } else {
      setFeedback(result.message || "Kayıt başarısız.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Yeni Personel Kaydı</h1>
      <div className={styles.form}>
        <input
          type="text"
          name="ad"
          placeholder="Ad"
          value={formData.ad}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="soyad"
          placeholder="Soyad"
          value={formData.soyad}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="sicil"
          placeholder="Sicil"
          value={formData.sicil}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="email"
          name="mail"
          placeholder="E-posta"
          value={formData.mail}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="username"
          placeholder="Kullanıcı Adı"
          value={formData.username}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
        />
        {
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="user">Kullanıcı</option>
            <option value="admin">Yönetici</option>
          </select>
        }
        {feedback && <p className={styles.feedback}>{feedback}</p>}
        <button onClick={handleSubmit} className={styles.button}>
          Kaydet
        </button>
      </div>
    </div>
  );
}
