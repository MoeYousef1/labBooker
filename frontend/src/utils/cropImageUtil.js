// utils/cropImageUtil.js

/**
 * getCroppedImg
 * @param {File} imageFile - the original file object from <input type="file">
 * @param {Object} croppedAreaPixels - { width, height, x, y } from react-easy-crop
 * @returns {Promise<File|Blob>}
 */
export async function getCroppedImg(imageFile, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (error) => reject(error);

    // Convert the file to a data URL
    reader.onload = async () => {
      const imageDataUrl = reader.result;
      const image = new Image();
      image.src = imageDataUrl;
      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to the size of the crop box
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw the cropped image onto the canvas
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        // Turn canvas into a Blob (or base64)
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          // Convert blob to a File (optional)
          const fileExt = imageFile.name.substring(imageFile.name.lastIndexOf("."));
          const newFile = new File([blob], `cropped_${Date.now()}${fileExt}`, {
            type: blob.type,
          });
          resolve(newFile);
        }, "image/jpeg", 1);
      };
    };
    reader.readAsDataURL(imageFile);
  });
}
