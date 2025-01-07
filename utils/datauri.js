import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  try {
    const extName = path.extname(file.originalname).toString(); // Get file extension
    return parser.format(extName, file.buffer).content; // Convert buffer to data URI
  } catch (error) {
    console.error("Error in getDataUri:", error);
    throw new Error("Failed to convert file to data URI.");
  }
};

export default getDataUri;
