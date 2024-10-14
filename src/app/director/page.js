// src/app/director/page.js
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../utils/auth";
import { fetchManagerApprovedForms, finalApproveForm } from "../server/server";
import { logoutUser } from "../server/loginActions";

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
      const result = await finalApproveForm(formId, isApproved);
      if (result.success) {
        // Update the forms list
        setForms(forms.filter((form) => form._id !== formId));
      }
    });
  };

  return (
    <div>
      <h1>Director Dashboard</h1>
      {/* Existing director-specific content */}

      <h2>Son Onay Bekleyen Formlar</h2>
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
