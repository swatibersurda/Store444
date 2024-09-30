import multer from "multer";
// multer used to store file on server locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store locally your files here.
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // dont need to cretae file unique name as we are deleting the file once we get link or it is not created
    // so no need to make diffrent suffix
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
