//src/app/page.js
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import { loginUser } from "./server/loginActions";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setFeedback("Kullanıcı adı ve şifre boş olamaz.");
      return;
    }

    const result = await loginUser(username, password);
    console.log(result);

    if (result.success) {
      setUser(result.user);
      const role = result.user.role;
      router.push(`/${role}`);
      console.log("login success");
    } else {
      setFeedback(result.message || "Kullanıcı adı veya şifre hatalı.");
    }
  };
  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoWhite}>aselsan</span>
          <span className={styles.logoOrange}>konya</span>
        </div>
      </header>
      <div className={styles.container}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.input}
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className={styles.input}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.loginButton} onClick={() => handleLogin()}>
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
