"use server";

import { connectToDatabase } from "../lib/db";
import { ObjectId } from "mongodb";

// General fetch function
async function fetch(collection) {
  const { db } = await connectToDatabase();
  if (!db) {
    throw new Error("Database connection failed");
  }
  try {
    const data = await db.collection(collection).find().toArray();
    return data;
  } catch (error) {
    throw new Error(`Error fetching from ${collection}: ${error.message}`);
  }
}

// Fetch users (personel)
export async function fetchUsers() {
  return await fetch("personel");
}

export async function submitForm(formData) {
  const { db } = await connectToDatabase();
  try {
    const formsCollection = db.collection("forms");
    await formsCollection.insertOne({
      ...formData,
      status: "pending",
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting form:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}
export async function fetchPendingForms() {
  const { db } = await connectToDatabase();
  try {
    const formsCollection = db.collection("forms");
    const pendingForms = await formsCollection
      .find({ status: "pending" })
      .toArray();
    return { success: true, forms: pendingForms };
  } catch (error) {
    console.error("Error fetching pending forms:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function approveForm(formId, isApproved) {
  const { db } = await connectToDatabase();
  try {
    const formsCollection = db.collection("forms");
    const form = await formsCollection.findOne({ _id: new ObjectId(formId) });
    if (!form) {
      return { success: false, message: "Form bulunamadı." };
    }

    const newStatus = isApproved ? "manager_approved" : "rejected";

    await formsCollection.updateOne(
      { _id: new ObjectId(formId) },
      { $set: { status: newStatus } }
    );

    const notificationsCollection = db.collection("notifications");
    await notificationsCollection.insertOne({
      userId: "director_user_id", // Replace with actual director user ID
      message: `Yeni bir form onay bekliyor: ${form.title}`,
      isRead: false,
      createdAt: new Date(),
    });

    // Optionally, create a notification here

    return { success: true };
  } catch (error) {
    console.error("Error approving form:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function fetchManagerApprovedForms() {
  const { db } = await connectToDatabase();
  try {
    const formsCollection = db.collection("forms");
    const approvedForms = await formsCollection
      .find({ status: "manager_approved" })
      .toArray();
    return { success: true, forms: approvedForms };
  } catch (error) {
    console.error("Error fetching manager-approved forms:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function finalApproveForm(formId, isApproved) {
  const { db } = await connectToDatabase();
  try {
    const formsCollection = db.collection("forms");
    const form = await formsCollection.findOne({ _id: new ObjectId(formId) });
    if (!form) {
      return { success: false, message: "Form bulunamadı." };
    }

    const newStatus = isApproved ? "director_approved" : "rejected";

    await formsCollection.updateOne(
      { _id: new ObjectId(formId) },
      { $set: { status: newStatus } }
    );

    // Inside finalApproveForm after updating form status

    // Create a notification for the worker
    const notificationsCollection = db.collection("notifications");
    await notificationsCollection.insertOne({
      userId: form.submittedBy,
      message: `Formunuz ${isApproved ? "onaylandı" : "reddedildi"}: ${
        form.title
      }`,
      isRead: false,
      createdAt: new Date(),
    });

    // Optionally, create a notification here

    return { success: true };
  } catch (error) {
    console.error("Error final approving form:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}
export async function fetchNotifications(userId) {
  const { db } = await connectToDatabase();
  try {
    const notificationsCollection = db.collection("notifications");
    const notifications = await notificationsCollection
      .find({ userId, isRead: false })
      .toArray();
    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function markNotificationAsRead(notificationId) {
  const { db } = await connectToDatabase();
  try {
    const notificationsCollection = db.collection("notifications");
    await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } }
    );
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}
