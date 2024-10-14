// src/app/components/Navbar.js
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "../utils/auth";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../server/server.js";
import { loginUser, logoutUser } from "../server/loginActions";
import styles from "./Navbar.module.css";
import { FaBell } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const user = getUser();
  const [notifications, setNotifications] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [cachedUser, setCachedUser] = useState(user);

  useEffect(() => {
    if (!cachedUser) {
      setCachedUser(user);
    } else if (cachedUser) {
      startTransition(async () => {
        const data = await fetchNotifications(cachedUser.id);
        if (data.success) {
          setNotifications(data.notifications);
        }
      });
    }
  }, [cachedUser]);

  const handleLogout = () => {
    logoutUser();
    clearUser();
    router.push("/");
  };

  const handleNotificationClick = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setNotifications(notifications.filter((n) => n._id !== notificationId));
    // Optionally, redirect or perform other actions
  };

  let navLinks = [];

  if (user) {
    const role = user.role;

    navLinks.push({ href: `/${role}`, label: "Dashboard" });

    if (role === "worker") {
      navLinks.push({ href: "/worker", label: "Form Gönder" });
    }

    if (role === "manager") {
      navLinks.push({ href: "/manager", label: "Onaylar" });
    }

    if (role === "director") {
      navLinks.push({ href: "/director", label: "Onaylar" });
    }

    navLinks.push({ href: "#", label: "Çıkış Yap", onClick: handleLogout });
  } else {
    navLinks.push({ href: "/", label: "Giriş Yap" });
  }
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo} onClick={() => router.push("/")}>
          Aselsan Konya
        </div>
        <div className={styles.navLinks}>
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick();
                }
              }}
            >
              {link.label}
            </a>
          ))}
          {user && (
            <div className={styles.notificationIcon}>
              <FaBell size={20} />
              {notifications.length > 0 && (
                <span className={styles.notificationCount}>
                  {notifications.length}
                </span>
              )}
              {/* Notification dropdown */}
              {notifications.length > 0 && (
                <div className={styles.notificationDropdown}>
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={styles.notificationItem}
                    >
                      <p>{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
