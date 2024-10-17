"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";
import { fetchPendingForms, approveForm, submitForm } from "../server/server";
import Navbar from "../components/page.js";
import styles from "./dashboard.module.css";

export default function ManagerDashboard() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const user = getUser();
  const [isPending, startTransition] = useTransition();
  const [cachedUser, setCachedUser] = useState(user);

  useEffect(() => {
    if (!cachedUser) {
      setCachedUser(user);
    } else if (!cachedUser || cachedUser.role !== "manager") {
      console.log(cachedUser.role);
      router.push("/");
    } else {
      startTransition(async () => {
        const data = await fetchPendingForms();
        if (data.success) {
          setForms(data.forms);
        }
      });
    }
  }, [cachedUser, router]);

  const handleApproval = (formId, isApproved) => {
    startTransition(async () => {
      const result = await approveForm(formId, isApproved, cachedUser.id); // Pass managerId
      if (result.success) {
        // Update the forms list
        setForms(forms.filter((form) => form._id !== formId));
      }
    });
  };

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
        requiresDirectorApproval: formData.requiresDirectorApproval,
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
    <div className={styles.main}>
      <Navbar />
      <div className={styles.container}>
        <h1>Manager Dashboard</h1>

        <h2>Onay Bekleyen Formlar</h2>
        {forms.length === 0 ? (
          <p>Onay bekleyen form yok.</p>
        ) : (
          forms.map((form) => (
            <div className={styles.formContainer} key={form._id}>
              <h3>{form.title}</h3>
              <p>{form.description}</p>
              <p>
                Gönderen: {form.submittedBy.ad} {form.submittedBy.soyad}
              </p>
              <p>Sicil: {form.submittedBy.sicil}</p>
              <p>Rol: {form.submittedBy.role}</p>
              <div className={styles.buttonsContainer}>
                <button
                  className={styles.onaylaButton}
                  onClick={() => handleApproval(form._id, true)}
                >
                  Onayla
                </button>
                <button
                  className={styles.reddetButton}
                  onClick={() => handleApproval(form._id, false)}
                >
                  Reddet
                </button>
              </div>
            </div>
          ))
        )}
      </div>
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
  );
}
