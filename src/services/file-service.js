const path = require("path");
const fs = require("fs");
const ResponseError = require("../utils/response-error");

const saveFileBase64 = async (content, filename, folderName) => {
  return new Promise((resolve, reject) => {
    const base64Data = content.split(",")[1]; // Gets the Base64 part only
    const buffer = Buffer.from(base64Data, "base64");

    if (!filename) {
      const extension = getFileExtensionFromBase64(content);
      if (!extension) throw new ResponseError("Extension file not found", 500);
      const uniqueFileName = generateUniqueFileName();
      filename = `${uniqueFileName}.${extension}`;
    }

    let pathFile = `../../public`;
    let destinationPath = "";

    if (folderName) {
      pathFile += `/${folderName}`;
      destinationPath = `/${folderName}/${filename}`;
    } else {
      destinationPath = filename;
    }

    const filePath = path.join(__dirname, pathFile, filename);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) return reject(err);
      resolve(destinationPath);
    });
  });
};

const checkAndRemoveFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullFilePath = `../../public/${filePath}`;
    const fileLocation = path.join(__dirname, fullFilePath);

    fs.access(fileLocation, fs.constants.F_OK, (err) => {
      if (err) {
        resolve("file not exists");
      }

      // If the file exists, remove it
      fs.unlink(fileLocation, (err) => {
        if (err) return reject(err);
        resolve("File removed successfully");
      });
    });
  });
};

const getFileExtensionFromBase64 = (base64String) => {
  // Ekstrak MIME type dari string Base64
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,/);
  if (!matches || matches.length < 2) {
    throw new Error("Invalid Base64 string");
  }
  const mimeType = matches[1];

  const extensionMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    // Tambahkan lebih banyak peta sesuai kebutuhan
  };

  return extensionMap[mimeType] || null;
};

const generateUniqueFileName = () => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const random = ("" + Math.random()).substring(2, 8);
  return timestamp + random;
};

module.exports = {
  saveFileBase64,
  checkAndRemoveFile,
};
