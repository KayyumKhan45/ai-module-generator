import React from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";

const Navbar = ({ user, setUser }) => {

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast.success(`Welcome, ${result.user.displayName}!`);
    } catch (error) {
      if (error.code === "auth/cancelled-popup-request") return;
      if (error.code === "auth/popup-blocked") {
        alert("Popup blocked! Please allow popups for this site.");
      } else {
        console.error("Login error:", error);
        toast.error("Login failed. Try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.info("Logged out successfully!");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error during logout");
    }
  };

  return (
    <nav className="bg-[#111111] text-white flex justify-between items-center px-6 py-4 shadow-md border-b border-zinc-800">
      {}
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
        GenUI
      </h1>

      {}
      <div className="flex items-center gap-4">
        {!user ? (
          <button
            onClick={handleGoogleLogin}
            className="bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-2 rounded-md hover:opacity-90 transition-all font-medium"
          >
            Sign in with Google
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {}
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="User"
                className="w-9 h-9 rounded-full border-2 border-purple-500"
              />
            )}
            {}
            <span className="font-semibold">{user.displayName}</span>

            {}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
