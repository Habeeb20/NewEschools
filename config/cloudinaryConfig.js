import pkg from "cloudinary"
const {v2:cloudinary} = pkg

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: 624216876378923,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  

  export default cloudinary