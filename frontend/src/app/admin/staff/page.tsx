"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navigation from "@/components/Navigation";
import { apiClient } from "@/services/apiClient";
import { useLanguageStore } from "@/stores/languageStore";
import { t } from "@/lib/translations";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function StaffPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthStore();
  const { language } = useLanguageStore();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      router.push("/login");
    }
  }, [isAuthenticated, isOwner, router]);

  // Load staff members
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      return;
    }

    loadStaff();
  }, [isAuthenticated, isOwner]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.listStaff();

      if (response.success && response.data) {
        setStaff(response.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("staff.failedToLoad", language),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError(t("staff.allFieldsRequired", language));
        return;
      }

      if (editingId) {
        await apiClient.editStaff(editingId, form.name, form.email);

        setSuccess(t("staff.updatedSuccessfully", language));
      } else {
        await apiClient.createStaff(form.name, form.email, form.password);

        setSuccess(t("staff.addedSuccessfully", language));
      }

      setForm({
        name: "",
        email: "",
        password: "",
      });

      setShowForm(false);
      setEditingId(null);
      setError("");

      loadStaff();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("staff.failedToSave", language),
      );
    }
  };

  const handleEdit = (member: Staff) => {
    setEditingId(member._id);

    setForm({
      name: member.name,
      email: member.email,
      password: "",
    });

    setShowForm(true);
    setError("");
  };

  const handleToggleStatus = async (staffId: string) => {
    try {
      await apiClient.toggleStaffStatus(staffId);

      setSuccess(t("staff.statusUpdated", language));

      loadStaff();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("staff.failedToUpdateStatus", language),
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);

    setForm({
      name: "",
      email: "",
      password: "",
    });

    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>

          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("staff.loading", language)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {t("staff.management", language)}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t("staff.manageDescription", language)}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingId(null);

                setForm({
                  name: "",
                  email: "",
                  password: "",
                });

                setShowForm(!showForm);
              }}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {t("staff.addStaffButton", language)}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Add/Edit Staff Form */}
          {showForm && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("staff.name", language)}
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("staff.email", language)}
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("staff.password", language)}{" "}
                      {editingId && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t("staff.leaveBlankToKeepCurrent", language)}
                        </span>
                      )}
                    </label>

                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingId}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingId
                      ? t("staff.updateMember", language)
                      : t("staff.addMember", language)}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition"
                  >
                    {t("common.cancel", language)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Staff Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t("staff.name", language)}
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t("staff.email", language)}
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t("staff.role", language)}
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {t("staff.status", language)}
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {t("staff.actions", language)}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {staff.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {t("staff.noMembers", language)}
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr
                        key={member._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </td>

                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {member.email}
                        </td>

                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {t("nav.staffRole", language)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              member.isActive
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {member.isActive
                              ? t("common.active", language)
                              : t("common.inactive", language)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(member)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                            >
                              {t("staff.edit", language)}
                            </button>

                            <button
                              onClick={() => handleToggleStatus(member._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                            >
                              {member.isActive
                                ? t("categories.deactivate", language)
                                : t("categories.activate", language)}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
