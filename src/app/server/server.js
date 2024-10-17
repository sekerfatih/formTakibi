// src/server/server.js
"use server";

import { connectToDatabase } from "../lib/db";
import Form from "../models/Form";
import Notification from "../models/Notification";
import Personel from "../models/Personel";

// Utility function to convert ObjectIds to strings, including nested fields
function convertIdsToStrings(data) {
  if (Array.isArray(data)) {
    return data.map((item) => convertItemIdsToStrings(item));
  } else {
    return convertItemIdsToStrings(data);
  }
}

function convertItemIdsToStrings(item) {
  const newItem = { ...item };

  // Convert top-level _id
  if (newItem._id) {
    newItem._id = newItem._id.toString();
  }

  // Convert nested ObjectId fields for 'submittedBy'
  if (newItem.submittedBy && newItem.submittedBy._id) {
    newItem.submittedBy._id = newItem.submittedBy._id.toString();
  }

  // Convert ObjectId for managerId inside managerApproval
  if (newItem.managerApproval && newItem.managerApproval.managerId) {
    newItem.managerApproval.managerId =
      newItem.managerApproval.managerId.toString();
  }

  // Convert ObjectId for directorId inside directorApproval
  if (newItem.directorApproval && newItem.directorApproval.directorId) {
    newItem.directorApproval.directorId =
      newItem.directorApproval.directorId.toString();
  }

  // Convert 'userId' if present
  if (newItem.userId) {
    newItem.userId = newItem.userId.toString();
  }

  // Convert 'relatedFormId' if present
  if (newItem.relatedFormId) {
    newItem.relatedFormId = newItem.relatedFormId.toString();
  }

  return newItem;
}

export async function submitForm(formData) {
  await connectToDatabase();
  try {
    let newForm;

    // Check if the user submitting the form is a manager
    const submittingUser = await Personel.findById(formData.submittedBy);
    const isManager = submittingUser && submittingUser.role === "manager";

    if (isManager) {
      // Manager submitting the form
      newForm = new Form({
        ...formData,
        status: formData.requiresDirectorApproval
          ? "approved by manager"
          : "approved",
        managerApproval: {
          approved: true,
          approvedAt: new Date(),
          managerId: formData.submittedBy,
        },
      });
    } else {
      // Worker submitting the form
      newForm = new Form({
        ...formData,
        status: "pending",
      });
    }

    await newForm.save();

    // Notify the director if it requires their approval
    if (isManager && formData.requiresDirectorApproval) {
      const director = await Personel.findOne({ role: "director" });
      if (director) {
        const newNotification = new Notification({
          userId: director._id,
          message: `Yeni bir form onay bekliyor: ${newForm.title}`,
          isRead: false,
          relatedFormId: newForm._id,
        });
        await newNotification.save();
      }
    } else if (isManager) {
      // Notify the manager (as a worker) that the form is approved
      const newNotification = new Notification({
        userId: formData.submittedBy,
        message: `Formunuz onaylandı: ${newForm.title}`,
        isRead: false,
        relatedFormId: newForm._id,
      });
      await newNotification.save();
    } else {
      // Notify the manager if a worker submits a form
      const manager = await Personel.findOne({ role: "manager" });
      if (manager) {
        const newNotification = new Notification({
          userId: manager._id,
          message: `Yeni bir form onay bekliyor: ${newForm.title}`,
          isRead: false,
        });
        await newNotification.save();
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting form:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function fetchPendingForms() {
  await connectToDatabase();
  try {
    const pendingForms = await Form.find({ status: "pending" })
      .populate("submittedBy", "ad soyad sicil role")
      .lean();

    const formsWithStringIds = convertIdsToStrings(pendingForms);
    return { success: true, forms: formsWithStringIds };
  } catch (error) {
    console.error("Error fetching pending forms:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function approveForm(formId, isApproved, managerId) {
  await connectToDatabase();
  try {
    const form = await Form.findById(formId);
    if (!form) {
      return { success: false, message: "Form bulunamadı." };
    }

    form.managerApproval = {
      approved: isApproved,
      approvedAt: new Date(),
      managerId,
    };

    if (!isApproved) {
      // If disapproved, set status to 'rejected'
      form.status = "rejected";
    } else if (form.requiresDirectorApproval) {
      // If approved and requires director approval
      form.status = "approved by manager";

      // Notify the director
      const director = await Personel.findOne({ role: "director" });
      if (director) {
        const newNotification = new Notification({
          userId: director._id,
          message: `Yeni bir form onay bekliyor: ${form.title}`,
          isRead: false,
          relatedFormId: form._id,
        });
        await newNotification.save();
      }
    } else {
      // If approved and does NOT require director approval
      form.status = "approved";

      // Notify the worker
      const newNotification = new Notification({
        userId: form.submittedBy.toString(),
        message: `Formunuz onaylandı: ${form.title}`,
        isRead: false,
        relatedFormId: form._id,
      });
      await newNotification.save();
    }

    await form.save();
    return { success: true };
  } catch (error) {
    console.error("Error approving form:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function fetchManagerApprovedForms() {
  await connectToDatabase();
  try {
    const approvedForms = await Form.find({
      status: "approved by manager",
      requiresDirectorApproval: true,
    })
      .populate("submittedBy", "ad soyad sicil role")
      .lean();

    const formsWithStringIds = convertIdsToStrings(approvedForms);
    return { success: true, forms: formsWithStringIds };
  } catch (error) {
    console.error("Error fetching manager-approved forms:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function finalApproveForm(formId, isApproved, directorId) {
  await connectToDatabase();
  try {
    const form = await Form.findById(formId);
    if (!form) {
      return { success: false, message: "Form bulunamadı." };
    }

    form.directorApproval = {
      approved: isApproved,
      approvedAt: new Date(),
      directorId,
    };

    form.status = isApproved ? "approved" : "rejected";
    await form.save();

    // Notify the worker
    const newNotification = new Notification({
      userId: form.submittedBy.toString(),
      message: `Formunuz ${isApproved ? "onaylandı" : "reddedildi"}: ${
        form.title
      }`,
      isRead: false,
      relatedFormId: form._id,
    });
    await newNotification.save();

    return { success: true };
  } catch (error) {
    console.error("Error final approving form:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function fetchNotifications(userId) {
  await connectToDatabase();
  try {
    const notifications = await Notification.find({ userId, isRead: false })
      .populate("userId", "ad soyad sicil role")
      .lean();

    const notificationsWithStringIds = convertIdsToStrings(notifications);
    return { success: true, notifications: notificationsWithStringIds };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function markNotificationAsRead(notificationId) {
  await connectToDatabase();
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}

export async function fetchFormById(formId) {
  await connectToDatabase();
  try {
    const form = await Form.findById(formId)
      .populate("submittedBy", "ad soyad sicil role")
      .lean();

    if (!form) {
      return { success: false, message: "Form bulunamadı." };
    }

    const formWithStringIds = convertIdsToStrings(form);
    return { success: true, form: formWithStringIds };
  } catch (error) {
    console.error("Error fetching form by ID:", error);
    return { success: false, message: "Sunucu hatası oluştu." };
  }
}
