"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "../utils/auth";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../server/server.js";
import { logoutUser } from "../server/loginActions";
import styles from "./Navbar.module.css";
import { FaBell } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [cachedUser, setCachedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== "undefined") {
      const user = getUser();
      console.log("Fetched User in Navbar:", user); // Debug log
      setCachedUser(user);
      setLoading(false); // Stop loading after fetching user

      if (user) {
        startTransition(async () => {
          const data = await fetchNotifications(user.id);
          if (data.success) {
            setNotifications(data.notifications);
          }
        });
      }
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    clearUser();
    router.push("/");
  };

  const handleNotificationClick = async (notification) => {
    await markNotificationAsRead(notification._id);
    setNotifications(notifications.filter((n) => n._id !== notification._id));

    // Redirect to the form details page if relatedFormId exists
    if (notification.relatedFormId) {
      router.push(`/forms/${notification.relatedFormId}`);
    }
  };

  if (loading) {
    return null; // Or render a loading indicator if you prefer
  }

  let navLinks = [];

  if (cachedUser) {
    const role = cachedUser.role;

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
      <div className={styles.logo} onClick={() => router.push("/")}>
        <span className={styles.logoWhite}>aselsan</span>
        <span className={styles.logoOrange}>konya</span>
      </div>
      <div className={styles.navContainer}>
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
          {cachedUser && (
            <div className={styles.notificationIcon}>
              <FaBell size={20} />
              {notifications.length > 0 && (
                <span className={styles.notificationCount}>
                  {notifications.length}
                </span>
              )}
              {notifications.length > 0 && (
                <div className={styles.notificationDropdown}>
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={styles.notificationItem}
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: "pointer" }}
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
