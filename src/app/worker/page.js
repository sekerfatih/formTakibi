"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";
import { submitForm } from "../server/server.js"; // Import the server action
import styles from "./dashboard.module.css";

export default function WorkerDashboard() {
  const router = useRouter();
  const [cachedUser, setCachedUser] = useState(getUser()); // Cached user state
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!cachedUser || cachedUser.role !== "worker") {
      router.push("/");
    }
  }, [cachedUser, router]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setFormData({ title: "", description: "" });
      } else {
        setFeedback(result.message || "Form gönderilirken bir hata oluştu.");
      }
    });
  };

  return (
    <div className="container">
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
          <button type="button" className="button" onClick={handleSubmit}>
            Gönder
          </button>
          {feedback && <p className={styles.feedback}>{feedback}</p>}
        </form>
      </div>
    </div>
  );
}
