import notesIllustration from "../assets/undraw_ideas_vn7a.png";

import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

import { toast } from "react-toastify";

import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  // Handle Input
  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // Handle Login
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await API.post(
        "/auth/login",
        formData
      );

      // Save Token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Save User
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      toast.success("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Login Failed"
      );
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] to-[#eef1ff] dark:from-[#0f172a] dark:to-[#111827] flex items-center justify-center px-6 py-10">

      {/* Main Container */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 relative">

          {/* Logo */}
          <h1 className="text-4xl font-bold text-indigo-600">
            NotesKeeper
          </h1>

          {/* Content */}
          <div>

            <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium">
              Your Ideas. Organized.
            </span>

            <h2 className="text-6xl font-bold text-gray-900 dark:text-white leading-tight mt-8">

              Welcome back,
              <br />

              <span className="text-indigo-600">
                Stay Productive
              </span>

            </h2>

            <p className="text-gray-500 dark:text-gray-400 text-xl mt-8 leading-10">

              Login to access your notes and
              continue organizing your thoughts
              effortlessly.

            </p>

          </div>

          {/* Illustration */}
          <div className="flex justify-center">
            <img
              src={notesIllustration}
              alt="Notes Illustration"
              className="w-[420px] object-contain"
            />
          </div>

          {/* Footer */}
          <p className="text-gray-400">
            © 2026 NotesKeeper
          </p>

        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-8 sm:p-14">

          <div className="w-full max-w-lg">

            {/* Mobile Logo */}
            <h1 className="lg:hidden text-4xl font-bold text-indigo-600 mb-10 text-center">
              NotesKeeper
            </h1>

            {/* Heading */}
            <div className="text-center mb-12">

              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">

                <LockKeyhole
                  className="text-indigo-600"
                  size={40}
                />

              </div>

              <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">

                Login

              </h2>

              <p className="text-gray-500 dark:text-gray-400 text-lg">

                Enter your credentials to continue

              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              {/* Email */}
              <div>

                <label className="block mb-3 text-gray-700 dark:text-gray-300 font-medium">
                  Email
                </label>

                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 bg-gray-50 dark:bg-gray-800">

                  <Mail
                    className="text-gray-400"
                    size={22}
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent outline-none w-full ml-4 text-lg dark:text-white"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="block mb-3 text-gray-700 dark:text-gray-300 font-medium">
                  Password
                </label>

                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 bg-gray-50 dark:bg-gray-800">

                  <LockKeyhole
                    className="text-gray-400"
                    size={22}
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent outline-none w-full ml-4 text-lg dark:text-white"
                  />

                </div>

              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition text-white py-5 rounded-2xl font-semibold text-xl flex items-center justify-center gap-3 shadow-lg"
              >

                Login

                <ArrowRight size={24} />

              </button>

            </form>

            {/* Register */}
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-lg">

              Don’t have an account?{" "}

              <Link
                to="/register"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Register
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;