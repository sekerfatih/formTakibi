// src/app/director/page.js
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";
import { fetchManagerApprovedForms, finalApproveForm } from "../server/server";
import { logoutUser } from "../server/loginActions";
import Navbar from "../components/page.js";
import styles from "./dashboard.module.css";

export default function DirectorDashboard() {
  const router = useRouter();
  const user = getUser();
  const [forms, setForms] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [cachedUser, setCachedUser] = useState(user);

  useEffect(() => {
    if (!cachedUser) {
      setCachedUser(user);
    } else if (!cachedUser || cachedUser.role !== "director") {
      router.push("/");
    } else {
      startTransition(async () => {
        const data = await fetchManagerApprovedForms();
        if (data.success) {
          setForms(data.forms);
        }
      });
    }
  }, [cachedUser]);

  const handleApproval = (formId, isApproved) => {
    startTransition(async () => {
      const result = await finalApproveForm(formId, isApproved, cachedUser.id); // Pass directorId
      if (result.success) {
        // Update the forms list
        setForms(forms.filter((form) => form._id !== formId));
      }
    });
  };

  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.container}>
        <h1>Director Dashboard</h1>

        <h2>Son Onay Bekleyen Formlar</h2>
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
    </div>
  );
}
