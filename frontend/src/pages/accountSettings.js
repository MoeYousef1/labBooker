import React, { useEffect, useState, useCallback } from "react";
import { SidebarLayout } from "../components/SidebarLayout";
import { User, Bell, Shield, Upload, XCircle } from "lucide-react";
import Message from "../components/Error_successMessage";
import VerificationModal from "../components/VerificationModal";
import api from "../utils/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImageUtil";
import { useContext } from "react";
import { ThemeContext } from '../contexts/ThemeContext';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  // From server
  const [userInfo, setUserInfo] = useState({
    email: "",
    username: "",
    name: "",
    profilePicture: null,
  });

  // Edit form state
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

  // Email verification modal state
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    email: "",
    code: "",
    error: "",
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

  // Clear messages on input interactions
  const clearMessages = () => {
    if (errors) setErrors("");
    if (successMessage) setSuccessMessage("");
  };

  // Handle file selection
  const handleImageChange = (e) => {
    clearMessages();
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;
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

  // Confirm cropping
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

  // Cancel cropping
  const handleCropCancel = () => {
    clearMessages();
    setShowCropper(false);
    setRawImage(null);
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    clearMessages();
    setEditForm((prev) => ({
      ...prev,
      image: null,
      previewUrl: "",
      removeImage: true,
    }));
  };

  // Handle email changes
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
        error: "",
      });
    } catch (error) {
      setErrors("Failed to initiate email change");
    }
  };

  const cancelEmailChangeRequest = async () => {
    try {
      await api.post("/user/cancel-email-change");
      setSuccessMessage("Email change request cancelled.");
    } catch (error) {
      setErrors(
        error.response?.data?.message ||
          "Failed to cancel email change request"
      );
    }
  };

  const handleVerifyEmail = async () => {
    clearMessages();
    try {
      await api.post("/user/verify-email-change", {
        verificationCode: verificationModal.code,
      });
      setUserInfo((prev) => ({
        ...prev,
        email: verificationModal.email,
      }));
      setVerificationModal({ isOpen: false, email: "", code: "", error: "" });
      setSuccessMessage("Email updated successfully");
      setIsEditing(false);
    } catch (error) {
      setVerificationModal((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Invalid verification code",
      }));
    }
  };

  const handleSaveChanges = async () => {
    clearMessages();
    try {
      setLoading(true);

      if (editForm.email !== userInfo.email) {
        await handleEmailChange(editForm.email);
        return;
      }

      if (editForm.name !== userInfo.name) {
        if (editForm.name.length < 2 || editForm.name.length > 50) {
          setErrors("Name must be between 2 and 50 characters");
          setLoading(false);
          return;
        }
      }

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

      const hasNameChange = editForm.name !== userInfo.name;
      const hasImageChange = editForm.image || editForm.removeImage;
      if (!hasNameChange && !hasImageChange) {
        setErrors("No changes to save");
        setLoading(false);
        return;
      }

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
      setErrors(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    clearMessages();
    if (isEditing) {
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
    <SidebarLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex flex-col items-center min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 overflow-x-hidden dark:bg-gray-900 transition-colors duration-300"
      >
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-6 sm:mb-8 transition-colors duration-300"
        >
          Profile Settings
        </motion.h1>
  
        {/* Tabs Navigation */}
        <div className="w-full max-w-4xl">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8"
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
                className={`flex items-center justify-center p-3 sm:p-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600 group ${
                  activeTab === id
                    ? "ring-2 ring-green-500 dark:ring-green-600 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-2">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm md:text-base mt-1 sm:mt-0">
                    {label}
                  </span>
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
          className="w-full max-w-4xl"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 md:p-10 transition-colors duration-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 sm:space-y-10"
              >
                {activeTab === "profile" && (
                  <div className="space-y-6 sm:space-y-10">
                    {/* Profile Picture Section */}
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 transition-colors duration-300">
                        Profile Picture
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                            {editForm.previewUrl ? (
                              <img
                                src={editForm.previewUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-400 dark:text-gray-300">
                                {userInfo.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
  
                          {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300">
                              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                          )}
                        </div>
  
                        <div className="text-center sm:text-left">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                            {userInfo.name}
                          </h3>
                          {isEditing && (
                            <>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Click the icon to choose a new profile picture
                              </p>
                              {editForm.previewUrl && (
                                <button
                                  onClick={handleRemoveImage}
                                  className="mt-2 px-3 py-1 inline-flex items-center text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-300"
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
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 transition-colors duration-300">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Username Field */}
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                            Username
                          </label>
                          <input
                            type="text"
                            value={userInfo.username}
                            disabled
                            className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-300"
                          />
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Username cannot be changed
                          </p>
                        </div>
  
                        {/* Name Field */}
<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
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
    className={`mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
      !isEditing ? "bg-gray-50" : ""
    } dark:bg-gray-700 transition-colors duration-300 dark:text-gray-200`}
  />
</div>

{/* Email Field */}
<div className="md:col-span-2 w-full">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
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
    className={`mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
      !isEditing ? "bg-gray-50" : ""
    } dark:bg-gray-700 transition-colors duration-300 dark:text-gray-200`}
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
                    <div className="flex justify-end space-x-2 sm:space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleEditToggle}
                            className="px-4 sm:px-6 py-2 sm:py-3 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-green-400 border border-gray-300 dark:border-gray-600 transition-colors duration-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveChanges}
                            disabled={loading}
                            className="px-4 sm:px-6 py-2 sm:py-3 text-sm bg-white dark:bg-gray-700 text-green-500 dark:text-green-400 rounded-lg shadow-md hover:bg-green-500 dark:hover:bg-green-600 hover:text-white focus:ring-2 focus:ring-green-400 transition-colors duration-300"
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditToggle}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm bg-white dark:bg-gray-700 text-green-500 dark:text-green-400 rounded-lg shadow-md hover:bg-green-500 dark:hover:bg-green-600 hover:text-white focus:ring-2 focus:ring-green-400 transition-colors duration-300"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                )}
  
  {activeTab === "security" && (
  // In your Appearance Settings section
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
    Appearance Settings
  </h3>
  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6">
    <label className="inline-flex items-center cursor-pointer w-full justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Dark Mode
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Toggle between light and dark themes
        </p>
      </div>
      
      <div className="inline-flex items-center">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <div className="
          relative 
          w-11 
          h-6 
          bg-gray-200 
          peer-focus:outline-none 
          peer-focus:ring-4 
          peer-focus:ring-green-300 
          dark:peer-focus:ring-green-800 
          rounded-full 
          peer 
          dark:bg-gray-600 
          peer-checked:bg-green-600 
          peer-checked:after:translate-x-full 
          after:content-['']
          after:absolute 
          after:top-[2px] 
          after:start-[2px] 
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all 
          dark:border-gray-600
        " />
      </div>
    </label>
  </div>
</div>
)}
  
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 transition-colors duration-300">
                        Notification Preferences
                      </h3>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 transition-colors duration-300">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                          Coming Soon
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          Notification settings will be available in a future update.
                        </p>
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
          error={verificationModal.error}
          onCodeChange={(code) =>
            setVerificationModal((prev) => ({ ...prev, code }))
          }
          onConfirm={handleVerifyEmail}
          onClose={() =>
            setVerificationModal({ isOpen: false, email: "", code: "", error: "" })
          }
          onCancelEmailChange={cancelEmailChangeRequest}
        />
  
        {/* Cropper Modal */}
        {showCropper && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl relative w-full max-w-sm sm:max-w-md transition-colors duration-300">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">
                Crop your photo
              </h2>
              <div className="relative w-full h-48 sm:h-64 bg-gray-200 dark:bg-gray-700">
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
                  className="w-2/3 dark:accent-green-500"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={handleCropCancel}
                  className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-green-400 border border-gray-300 dark:border-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-6 py-3 bg-white dark:bg-gray-700 text-green-500 dark:text-green-400 rounded-lg shadow-md hover:bg-green-500 dark:hover:bg-green-600 hover:text-white focus:ring-2 focus:ring-green-400 transition-all duration-300"
                >
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </SidebarLayout>
  );
};

export default ProfileSettings;
