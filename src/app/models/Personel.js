// src/models/Personel.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const personelSchema = new Schema(
  {
    ad: {
      type: String,
      required: true,
    },
    soyad: {
      type: String,
      required: true,
    },
    sicil: {
      type: String,
      required: true,
      unique: true,
    },
    mail: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["worker", "manager", "director"],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "personel",
  }
);

const Personel =
  mongoose.models.Personel || mongoose.model("Personel", personelSchema);

export default Personel;
