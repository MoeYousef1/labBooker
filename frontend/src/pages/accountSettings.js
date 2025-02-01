import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/SideBar";
import { User, Bell, Shield, Upload, XCircle } from "lucide-react";
import Toast from "../components/errsucModal";
import VerificationModal from "../components/VerificationModal";
import api from "../utils/axiosConfig";

// Cropper
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
    image: null,        // new cropped File
    previewUrl: "",     // dataURL for immediate preview
    removeImage: false, // whether user wants to remove the existing image
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, type: "", message: "" });

  // Email verification modal
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    email: "",
    code: "",
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
        showToast("error", "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  // Show toast
  const showToast = (type, message) => {
    setToast({ isVisible: true, type, message });
    setTimeout(() => setToast({ isVisible: false, type: "", message: "" }), 3000);
  };

  // Handle file pick
  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      showToast("error", "Please upload a valid image file (JPEG, PNG)");
      return;
    }
    if (file.size > maxSize) {
      showToast("error", "Image size should be less than 5MB");
      return;
    }

    setRawImage(file);
    setShowCropper(true);
  };

  // Cropper callbacks
  const onCropChange = useCallback((newCrop) => setCrop(newCrop), []);
  const onZoomChange = useCallback((newZoom) => setZoom(newZoom), []);
  const onCropComplete = useCallback((_, croppedAreaPx) => setCroppedAreaPixels(croppedAreaPx), []);

  // Confirm Crop
  const handleCropComplete = async () => {
    try {
      const croppedFile = await getCroppedImg(rawImage, croppedAreaPixels);
      // Show immediate preview
      const previewUrl = URL.createObjectURL(croppedFile);
      setEditForm((prev) => ({
        ...prev,
        image: croppedFile,
        previewUrl,
        removeImage: false, // If we had removeImage set earlier, override it
      }));
      // Hide cropper
      setShowCropper(false);
    } catch (err) {
      showToast("error", "Failed to crop image");
    }
  };

  // Cancel Crop
  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImage(null);
    showToast("info", "Image selection cancelled");
  };

  // Remove existing profile picture
  const handleRemoveImage = () => {
    setEditForm((prev) => ({
      ...prev,
      image: null,      // no new image
      previewUrl: "",   // remove local preview
      removeImage: true,
    }));
  };

  // handle email changes
  const handleEmailChange = async (newEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showToast("error", "Please enter a valid email address");
      return;
    }
    try {
      const checkRes = await api.post("/user/check-email", { email: newEmail });
      if (!checkRes.data.available) {
        showToast("error", "Email is already in use");
        return;
      }
      // Initiate email change
      await api.post("/user/initiate-email-change", { newEmail });
      setVerificationModal({
        isOpen: true,
        email: newEmail,
        code: "",
      });
    } catch (error) {
      showToast("error", "Failed to initiate email change");
    }
  };

  // verify email code
  const handleVerifyEmail = async () => {
    try {
      await api.post("/user/verify-email-change", {
        verificationCode: verificationModal.code,
      });
      setUserInfo((prev) => ({
        ...prev,
        email: verificationModal.email,
      }));
      setVerificationModal({ isOpen: false, email: "", code: "" });
      showToast("success", "Email updated successfully");
      setIsEditing(false);
    } catch (error) {
      showToast("error", "Invalid verification code");
    }
  };

  // Save changes (name, image, etc.)
const handleSaveChanges = async () => {
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
        showToast("error", "Name must be between 2 and 50 characters");
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
      // new cropped image
      formData.append("image", editForm.image);
    }
    if (editForm.removeImage) {
      formData.append("removeImage", "true");
    }

    // if no changes
    const hasNameChange = editForm.name !== userInfo.name;
    const hasImageChange = editForm.image || editForm.removeImage;
    if (!hasNameChange && !hasImageChange) {
      showToast("error", "No changes to save");
      setLoading(false);
      return;
    }

    // Send request
    const response = await api.put("/user/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // <<--- NEW LOGIC HERE --->>
    // 1) Extract the updated user from the response
    const { user: updatedUser } = response.data;

    // 2) Update the local state with the new user
    setUserInfo(updatedUser);

    // 3) Also sync localStorage so other pages see the updated user info
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 4) Update your editForm preview, etc.
    setEditForm((prev) => ({
      ...prev,
      image: null,
      removeImage: false,
      previewUrl: updatedUser.profilePicture || "",
    }));
    setRawImage(null);
    setIsEditing(false);

    // 5) Show success toast
    showToast("success", "Profile updated successfully");
  } catch (error) {
    showToast("error", error.response?.data?.message || "Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col px-6 sm:px-8 md:px-12 mt-16 sm:mt-0 sm:ml-64 py-10">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Profile &amp; Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "notifications", label: "Notifications", icon: Bell },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                        {/* If user has chosen a new cropped image, show it; else show userInfo, else fallback */}
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
                      <h3 className="text-lg font-medium text-gray-900">{userInfo.username}</h3>
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

                  {/* Profile Form */}
                  <div className="space-y-4">
                    {/* Username (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        value={userInfo.username}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                        {isEditing && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="email"
                        value={isEditing ? editForm.email : userInfo.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                          isEditing
                            ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            : "bg-gray-50 border-gray-300"
                        }`}
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                        {isEditing && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={isEditing ? editForm.name : userInfo.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                          isEditing
                            ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            : "bg-gray-50 border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            // reset any changes
                            setIsEditing(false);
                            setEditForm({
                              email: userInfo.email,
                              name: userInfo.name,
                              image: null,
                              previewUrl: userInfo.profilePicture || "",
                              removeImage: false,
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveChanges}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Password &amp; Security</h3>
                    <button
                      onClick={() => navigate("/changepassword")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Notification Preferences Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      Notification settings will be available in a future update.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        email={verificationModal.email}
        code={verificationModal.code}
        onCodeChange={(code) => setVerificationModal((prev) => ({ ...prev, code }))}
        onConfirm={handleVerifyEmail}
        onClose={() => setVerificationModal({ isOpen: false, email: "", code: "" })}
      />

      {/* Toast Notification */}
      {toast.isVisible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Crop your photo</h2>
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
            {/* Zoom controls */}
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
