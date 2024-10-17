"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";
import { submitForm } from "../server/server.js"; // Import the server action
import styles from "./dashboard.module.css";
import Navbar from "../components/page.js";

export default function WorkerDashboard() {
  const router = useRouter();
  const user = getUser();
  const [cachedUser, setCachedUser] = useState(user); // Cached user state
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!cachedUser) {
      setCachedUser(user);
    } else if (!cachedUser || cachedUser.role !== "worker") {
      console.log(cachedUser.role);
      router.push("/");
    }
  }, [cachedUser, router]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiresDirectorApproval: false,
  });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      setFeedback("Tüm alanları doldurun.");
      return;
    }

    startTransition(async () => {
      const result = await submitForm({
        ...formData,
        submittedBy: cachedUser.id,
      });
      if (result.success) {
        setFeedback("Form başarıyla gönderildi.");
        setFormData({
          title: "",
          description: "",
          requiresDirectorApproval: false,
        });
      } else {
        setFeedback(result.message || "Form gönderilirken bir hata oluştu.");
      }
    });
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1>Worker Dashboard</h1>
        {/* Worker-specific content */}
        <div className={styles.formSection}>
          <h2>Form Gönder</h2>
          <form className={styles.form}>
            <label>
              Başlık:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </label>
            <label>
              Açıklama:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </label>
            <label className={styles.label}>
              Direktör onayı Gerekiyor mu?
              <input
                type="checkbox"
                name="requiresDirectorApproval"
                checked={formData.requiresDirectorApproval}
                onChange={handleChange}
              />
            </label>
            <button type="button" className="button" onClick={handleSubmit}>
              Gönder
            </button>
            {feedback && <p className={styles.feedback}>{feedback}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
