// src/models/Form.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const formSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "Personel", // Reference to the personel collection
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved by manager", "approved", "rejected"],
      default: "pending",
    },
    managerApproval: {
      approved: {
        type: Boolean,
        default: null, // Null means not yet reviewed
      },
      approvedAt: {
        type: Date,
        default: null,
      },
      managerId: {
        type: Schema.Types.ObjectId,
        ref: "Personel", // Reference to the manager who approved/rejected
        default: null,
      },
    },
    requiresDirectorApproval: {
      type: Boolean,
      default: false, // Default to false if not specified
    },
    directorApproval: {
      approved: {
        type: Boolean,
        default: null, // Null means not yet reviewed
      },
      approvedAt: {
        type: Date,
        default: null,
      },
      directorId: {
        type: Schema.Types.ObjectId,
        ref: "Personel", // Reference to the director who approved/rejected
        default: null,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: "forms", // Corrected syntax
  }
);

// Create the model
const Form = mongoose.models.Form || mongoose.model("Form", formSchema);

export default Form;
