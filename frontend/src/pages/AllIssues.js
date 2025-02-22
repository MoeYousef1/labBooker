import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SidebarLayout } from "../components/SidebarLayout";
import { AlertCircle, Search, CheckCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const AllIssues = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return {
          background: "bg-yellow-50",
          text: "text-yellow-700",
          hover: "hover:bg-yellow-100",
          border: "border-yellow-200",
          ring: "focus:ring-yellow-200",
          icon: "text-yellow-600",
        };
      case "in-progress":
        return {
          background: "bg-blue-50",
          text: "text-blue-700",
          hover: "hover:bg-blue-100",
          border: "border-blue-200",
          ring: "focus:ring-blue-200",
          icon: "text-blue-600",
        };
      case "resolved":
        return {
          background: "bg-green-50",
          text: "text-green-700",
          hover: "hover:bg-green-100",
          border: "border-green-200",
          ring: "focus:ring-green-200",
          icon: "text-green-600",
        };
      default:
        return {
          background: "bg-gray-50",
          text: "text-gray-700",
          hover: "hover:bg-gray-100",
          border: "border-gray-200",
          ring: "focus:ring-gray-200",
          icon: "text-gray-600",
        };
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/issues/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(response.data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to fetch issues");
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/issues/update-status/${issueId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.issue) {
        setIssues(
          issues.map((issue) =>
            issue._id === issueId ? response.data.issue : issue
          )
        );
        setSuccessMessage("Status updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        setError("");
      }
    } catch (err) {
      setError(err?.response?.data?.msg || "Error updating status");
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/issues/delete/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(issues.filter((issue) => issue._id !== issueId));
      setSuccessMessage("Issue deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.msg || "Error deleting issue");
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issueType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || issue.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 p-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Issue Management
            </h1>
            <p className="text-gray-600">
              Track and manage all reported issues
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by description, email, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full md:w-48 px-4 py-3 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mx-6 mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            )}

            {/* Table Section */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-500 text-sm">
                      Loading issues...
                    </p>
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Reported By
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIssues.map((issue) => (
                      <tr
                        key={issue._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize
                            ${
                              issue.issueType === "technical"
                                ? "bg-purple-100 text-purple-800"
                                : issue.issueType === "booking"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {issue.issueType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            {issue.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {issue.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={issue.status}
                              onChange={(e) =>
                                handleStatusUpdate(issue._id, e.target.value)
                              }
                              className={`appearance-none cursor-pointer pl-4 pr-10 py-2 rounded-full text-sm font-medium transition-all duration-200
                                ${getStatusStyles(issue.status).background}
                                ${getStatusStyles(issue.status).text}
                                ${getStatusStyles(issue.status).hover}
                                border-2 
                                ${getStatusStyles(issue.status).border}
                                focus:outline-none focus:ring-2
                                ${getStatusStyles(issue.status).ring}
                              `}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg
                                className={`h-4 w-4 transition-colors duration-200 ${
                                  getStatusStyles(issue.status).icon
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(issue._id)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!loading && filteredIssues.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="text-gray-400 mb-2">
                    <Search className="h-12 w-12" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No issues found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </SidebarLayout>
  );
};

export default AllIssues;
