// src/app/forms/[id]/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser } from "../../utils/auth";
import { fetchFormById } from "../../server/server";
import Navbar from "../../components/page.js";
import styles from "./forms.module.css";

export default function FormDetailsPage() {
  const router = useRouter();
  const { id } = useParams(); // Get the form ID from the URL
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      const data = await fetchFormById(id);
      if (data.success) {
        setForm(data.form);
      } else {
        // Handle error, e.g., redirect or show a message
        router.push("/");
      }
    };

    fetchForm();
  }, [id]);

  if (!form) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.detailsContainer}>
          <h1>{form.title}</h1>
          <p>{form.description}</p>
          <div className={styles.formDetails}>
            <p>
              Gönderen: {form.submittedBy.ad} {form.submittedBy.soyad}
            </p>
            <p>Sicil: {form.submittedBy.sicil}</p>
            <p>Rol: {form.submittedBy.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
