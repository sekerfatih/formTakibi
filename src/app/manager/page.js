"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";
import { fetchPendingForms, approveForm } from "../server/server";

export default function ManagerDashboard() {
  const router = useRouter();
  const [cachedUser, setCachedUser] = useState(getUser()); // Cached user state
  const [forms, setForms] = useState([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!cachedUser || cachedUser.role !== "manager") {
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
      const result = await approveForm(formId, isApproved);
      if (result.success) {
        // Update the forms list
        setForms(forms.filter((form) => form._id !== formId));
      }
    });
  };

  return (
    <div>
      <h1>Manager Dashboard</h1>

      <h2>Onay Bekleyen Formlar</h2>
      {forms.length === 0 ? (
        <p>Onay bekleyen form yok.</p>
      ) : (
        forms.map((form) => (
          <div key={form._id}>
            <h3>{form.title}</h3>
            <p>{form.description}</p>
            <button onClick={() => handleApproval(form._id, true)}>
              Onayla
            </button>
            <button onClick={() => handleApproval(form._id, false)}>
              Reddet
            </button>
          </div>
        ))
      )}
    </div>
  );
}
