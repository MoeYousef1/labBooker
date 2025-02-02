import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/SideBar";
import { User, Bell, Shield, Upload, XCircle } from "lucide-react";
import Message from "../components/Error_successMessage";
import VerificationModal from "../components/VerificationModal";
import api from "../utils/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImageUtil";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // From server
  const [userInfo, setUserInfo] = useState({
    email: "",
    username: "",
    name: "",
    profilePicture: null,
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    email: "",
    name: "",
    image: null,
    previewUrl: "",
    removeImage: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Email verification modal
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    email: "",
    code: "",
    error: "",   // <-- Added for modal-specific errors
  });
  

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Fetch current user info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        const data = response.data;
        setUserInfo(data);
        setEditForm({
          email: data.email,
          name: data.name,
          image: null,
          previewUrl: data.profilePicture || "",
          removeImage: false,
        });
      } catch (error) {
        setErrors("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  // Whenever the user interacts with inputs, clear previous messages
  const clearMessages = () => {
    if (errors) setErrors("");
    if (successMessage) setSuccessMessage("");
  };

  // Handle file pick
  const handleImageChange = (e) => {
    clearMessages();
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      setErrors("Please upload a valid image file (JPEG, PNG)");
      return;
    }
    if (file.size > maxSize) {
      setErrors("Image size should be less than 5MB");
      return;
    }

    setRawImage(file);
    setShowCropper(true);
  };

  // Cropper callbacks
  const onCropChange = useCallback((newCrop) => setCrop(newCrop), []);
  const onZoomChange = useCallback((newZoom) => setZoom(newZoom), []);
  const onCropComplete = useCallback(
    (_, croppedAreaPx) => setCroppedAreaPixels(croppedAreaPx),
    []
  );

  // Confirm Crop
  const handleCropComplete = async () => {
    clearMessages();
    try {
      const croppedFile = await getCroppedImg(rawImage, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);
      setEditForm((prev) => ({
        ...prev,
        image: croppedFile,
        previewUrl,
        removeImage: false,
      }));
      setShowCropper(false);
    } catch (err) {
      setErrors("Failed to crop image");
    }
  };

  // Cancel Crop
  const handleCropCancel = () => {
    clearMessages();
    setShowCropper(false);
    setRawImage(null);
  };

  // Remove existing profile picture
  const handleRemoveImage = () => {
    clearMessages();
    setEditForm((prev) => ({
      ...prev,
      image: null,
      previewUrl: "",
      removeImage: true,
    }));
  };

  // handle email changes
  const handleEmailChange = async (newEmail) => {
    clearMessages();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrors("Please enter a valid email address");
      return;
    }
    try {
      const checkRes = await api.post("/user/check-email", { email: newEmail });
      if (!checkRes.data.available) {
        setErrors("Email is already in use");
        return;
      }
      await api.post("/user/initiate-email-change", { newEmail });
      setVerificationModal({
        isOpen: true,
        email: userInfo.email,
        code: "",
      });
    } catch (error) {
      setErrors("Failed to initiate email change");
    }
  };

  // verify email code
  const handleVerifyEmail = async () => {
    clearMessages(); // still clears main page errors/success
    try {
      await api.post("/user/verify-email-change", {
        verificationCode: verificationModal.code,
      });
      // If success, close the modal and show success in the main area
      setUserInfo((prev) => ({
        ...prev,
        email: verificationModal.email,
      }));
      setVerificationModal({ isOpen: false, email: "", code: "", error: "" });
      setSuccessMessage("Email updated successfully");
      setIsEditing(false);
    } catch (error) {
      // Instead of setting main `errors`, we set the modal-specific error
      setVerificationModal((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Invalid verification code",
      }));
    }
  };
  

  // Save changes (name, image, etc.)
  const handleSaveChanges = async () => {
    clearMessages();
    try {
      setLoading(true);

      // If changed email
      if (editForm.email !== userInfo.email) {
        await handleEmailChange(editForm.email);
        return; // Stop here so user can confirm code
      }

      // Validate name
      if (editForm.name !== userInfo.name) {
        if (editForm.name.length < 2 || editForm.name.length > 50) {
          setErrors("Name must be between 2 and 50 characters");
          setLoading(false);
          return;
        }
      }

      // Build form data
      const formData = new FormData();
      if (editForm.name !== userInfo.name) {
        formData.append("name", editForm.name);
      }
      if (editForm.image) {
        formData.append("image", editForm.image);
      }
      if (editForm.removeImage) {
        formData.append("removeImage", "true");
      }

      // if no changes
      const hasNameChange = editForm.name !== userInfo.name;
      const hasImageChange = editForm.image || editForm.removeImage;
      if (!hasNameChange && !hasImageChange) {
        setErrors("No changes to save");
        setLoading(false);
        return;
      }

      // Send request
      const response = await api.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { user: updatedUser } = response.data;
      setUserInfo(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditForm((prev) => ({
        ...prev,
        image: null,
        removeImage: false,
        previewUrl: updatedUser.profilePicture || "",
      }));
      setRawImage(null);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      setErrors(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    clearMessages();
    if (isEditing) {
      // Cancel editing
      setEditForm({
        email: userInfo.email,
        name: userInfo.name,
        image: null,
        previewUrl: userInfo.profilePicture || "",
        removeImage: false,
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 mt-16 sm:mt-0 sm:ml-64"
      >
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 text-center mb-8 mt-4"
        >
          Profile Settings
        </motion.h1>

        {/* Tabs Navigation */}
        <div className="w-full max-w-4xl">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
          >
            {[
              { label: "Profile", id: "profile", icon: User },
              { label: "Lock", id: "security", icon: Shield },
              { label: "Alerts", id: "notifications", icon: Bell },
            ].map(({ label, id, icon: Icon }) => (
              <motion.button
                key={id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  hover: { scale: 1.05 },
                  tap: { scale: 0.95 },
                }}
                whileHover="hover"
                whileTap="tap"
                onClick={() => {
                  clearMessages();
                  setActiveTab(id);
                }}
                className={`flex items-center justify-center p-6 bg-white text-gray-800 font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group ${
                  activeTab === id
                    ? "ring-2 ring-green-500 bg-green-50 text-green-700"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className="min-w-[20px] w-6 h-6 sm:min-w-[16px] sm:w-4 sm:h-4 md:min-w-[20px] md:w-5 md:h-5" />
                  <span className="text-lg sm:text-base whitespace-nowrap">{label}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mt-6"
        >
          <div className="max-w-6xl mx-auto p-10 bg-gray-50 rounded-lg shadow-xl mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {activeTab === "profile" && (
                  <div className="space-y-10">
                    {/* Profile Picture Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Profile Picture
                      </h3>
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                            {editForm.previewUrl ? (
                              <img
                                src={editForm.previewUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                {userInfo.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>

                          {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <Upload className="w-4 h-4 text-gray-600" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {userInfo.name}
                          </h3>
                          {isEditing && (
                            <>
                              <p className="text-sm text-gray-500">
                                Click the icon to choose a new profile picture
                              </p>
                              {editForm.previewUrl && (
                                <button
                                  onClick={handleRemoveImage}
                                  className="mt-2 px-3 py-1 inline-flex items-center text-sm rounded-md text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Remove
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <input
                            type="text"
                            value={userInfo.username}
                            disabled
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Username cannot be changed
                          </p>
                        </div>

                        {/* Name Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Name
                            {isEditing && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type="text"
                            value={isEditing ? editForm.name : userInfo.name}
                            onChange={(e) => {
                              clearMessages();
                              setEditForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                            }}
                            disabled={!isEditing}
                            className={`mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                              !isEditing && "bg-gray-50"
                            }`}
                          />
                        </div>

                        {/* Email Field */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                            {isEditing && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type="email"
                            value={isEditing ? editForm.email : userInfo.email}
                            onChange={(e) => {
                              clearMessages();
                              setEditForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }));
                            }}
                            disabled={!isEditing}
                            className={`mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                              !isEditing && "bg-gray-50"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="text-center">
                      {errors && (
                        <Message
                          message={errors}
                          type="error"
                          onClose={() => setErrors("")}
                        />
                      )}
                      {successMessage && (
                        <Message
                          message={successMessage}
                          type="success"
                          onClose={() => setSuccessMessage("")}
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleEditToggle}
                            className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-2 focus:ring-green-400 border border-gray-300 transition-all duration-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveChanges}
                            disabled={loading}
                            className="px-6 py-3 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400 transition-all duration-300"
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditToggle}
                          className="px-6 py-3 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400 transition-all duration-300"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Password & Security
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <p className="text-gray-600 mb-4">
                            Manage your password and security settings
                          </p>
                          <button
                            onClick={() => navigate("/changepassword")}
                            className="px-6 py-3 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400 transition-all duration-300"
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Notification Preferences
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">
                            Coming Soon
                          </h4>
                          <p className="text-gray-600">
                            Notification settings will be available in a future update.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Verification Modal */}
        <VerificationModal
  isOpen={verificationModal.isOpen}
  email={verificationModal.email}
  code={verificationModal.code}
  error={verificationModal.error}           // <-- new prop
  onCodeChange={(code) =>
    setVerificationModal((prev) => ({ ...prev, code }))
  }
  onConfirm={handleVerifyEmail}
  onClose={() =>
    setVerificationModal({ isOpen: false, email: "", code: "", error: "" })
  }
/>


        {/* Cropper Modal */}
        {showCropper && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Crop your photo
              </h2>
              <div className="relative w-full h-64 bg-gray-200">
                <Cropper
                  image={rawImage && URL.createObjectURL(rawImage)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropComplete}
                  restrictPosition={false}
                />
              </div>
              <div className="mt-2 flex justify-center">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-2/3"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={handleCropCancel}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-2 focus:ring-green-400 border border-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-6 py-3 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-500 hover:text-white focus:ring-2 focus:ring-green-400 transition-all duration-300"
                >
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
