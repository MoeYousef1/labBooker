import React, { useState } from "react";
import axios from "axios";
import { AlertCircle, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const IssueReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    email: "",
    bookingReference: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/issues/create", formData);
      setMessage({
        type: "success",
        content: "Issue reported successfully! We'll look into it shortly.",
      });
      setFormData({
        issueType: "",
        description: "",
        email: "",
        bookingReference: "",
      });
    } catch (err) {
      setMessage({
        type: "error",
        content: err.response?.data?.msg || "Error reporting issue",
      });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Report an Issue
                </h1>
                <p className="text-gray-600 text-lg">
                  Having problems? Let us know and we'll help you sort it out.
                </p>
              </div>
            </div>
          </div>

          {/* Message Alert */}
          {message.content && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-100 border-green-200 border"
                  : "bg-red-100 border-red-200 border"
              }`}
            >
              <AlertCircle
                className={`h-5 w-5 flex-shrink-0 ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.content}
              </span>
            </motion.div>
          )}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Issue Type *
              </label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                required
              >
                <option value="">Select Issue Type</option>
                <option value="booking">Booking Problem</option>
                <option value="technical">Technical Error</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 resize-none"
                placeholder="Please provide details about your issue..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Booking Reference
                </label>
                <input
                  type="text"
                  name="bookingReference"
                  value={formData.bookingReference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold
                  hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 
                  transform transition-all duration-200 hover:scale-[1.02]
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-red-400">*</span>
              Required fields
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueReport;
