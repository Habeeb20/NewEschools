import express from "express";
import User from "../../../models/Eschools/user.js";
import School from "../../../models/Eschools/schools/school.schema.js"
import jwt from "jsonwebtoken"
import { roleBasedAccess, Protect } from "../../../middleware/protect.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary"
import SchoolUsers from "../../../models/Eschools/schools/schoolUsers.js";
const schoolrouter = express.Router()



schoolrouter.post(
    "/postschooldata",
    Protect,
    async (req, res) => {
      try {
        const userId = req.user.id; 
        const { schoolName } = req.body;
  
       
        const user = await User.findOne({ _id: userId, });
        if (!user) {
          return res.status(404).json({ message: "User account not found or invalid role" });
        }
  
    
        const existingSchool = await School.findOne({ userId });
        if (existingSchool) {
            console.log( "User has already registered a school")
          return res.status(400).json({ message: "User has already registered a school" });
        }
  
      
        const school = new School({
          userId,
          schoolName,
        });
  
        await school.save();
        return res.status(200).json({ message: "School registered successfully!", school });
  
      } catch (error) {
        console.error("Error registering school:", error);
        return res.status(500).json({ message: "An error occurred" });
      }
    }
  );
  

//get a school for schoolName
schoolrouter.get("/getschooldata", Protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const school = await School.findOne({ userId });

        if (!school) {
            return res.status(404).json({ message: "No school registered" });
        }

        return res.status(200).json({ school });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});





// schoolrouter.put(
//     "/:id",
//     Protect,
//     roleBasedAccess(["school-administrator"]),
//     async (req, res) => {
//       const { id } = req.params;
//       console.log(req.params)
  
//       try {
    
//         const user = await User.findById(req.user.id);
//         if (!user) {
//           return res.status(404).json({ message: "User account not found" });
//         }
  
     
//         const school = await School.findById(id);
//         if (!school) {
//           return res.status(404).json({ message: "School not found" });
//         }
  
     
//         if (school.userId.toString() !== req.user.id) {
//           return res.status(403).json({ message: "Not authorized to update this school" });
//         }
  
//         let updates = { ...req.body };
  
      
//         const uploadFile = async (file) => {
//           const result = await cloudinary.uploader.upload(file.tempFilePath, {
//             folder: "schools",
//           });
//           return result.secure_url;
//         };
  
     
//         if (req.files) {
//           const fileKeys = Object.keys(req.files);
//           for (const key of fileKeys) {
//             updates[`pictures.${key}`] = await uploadFile(req.files[key]);
//           }
//         }
  

//         if (req.body.schoolFees) {
//           updates.schoolFees = JSON.parse(req.body.schoolFees); // Expecting JSON array input
//         }
  
//         // Handle dynamic updates for jobVacancies array
//         if (req.body.jobVacancies) {
//           updates.jobVacancies = JSON.parse(req.body.jobVacancies); // Expecting JSON array input
//         }
  
//         // Update the school in the database
//         const updatedSchool = await School.findByIdAndUpdate(id, updates, { new: true });
  
//         if (!updatedSchool) {
//           return res.status(500).json({ message: "Failed to update school" });
//         }
  
//         res.status(200).json({
//           message: "School updated successfully",
//           updatedSchool,
//         });
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred" });
//       }
//     }
//   );

//get all school
// schoolrouter.get("/school", async(req, res) => {
//     try {
//         const schools = await School.find({})
//         res.json(schools)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message: "an error occurred"})
//     }
// })





schoolrouter.put(
  "/:id",
  Protect,
  roleBasedAccess(["school-administrator"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      console.log(req.params);

      // Verify user existence
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      // Verify school existence
      const school = await School.findById(id);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      // Ensure only the school owner can update the school
      if (school.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this school" });
      }

      let updates = { ...req.body };

      // File upload handler
      if (req.files) {
        const uploadFile = async (file) => {
          try {
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
              folder: "schools",
            });
            return result.secure_url;
          } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            throw new Error("File upload failed");
          }
        };

        const fileKeys = Object.keys(req.files);
        for (const key of fileKeys) {
          updates[`pictures.${key}`] = await uploadFile(req.files[key]);
        }
      }

      // Parse JSON fields if provided
      try {
        if (req.body.schoolFees) {
          updates.schoolFees = JSON.parse(req.body.schoolFees);
        }
        if (req.body.jobVacancies) {
          updates.jobVacancies = JSON.parse(req.body.jobVacancies);
        }
      } catch (error) {
        return res.status(400).json({ message: "Invalid JSON format in request body" });
      }

      // Update school details
      const updatedSchool = await School.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedSchool) {
        return res.status(500).json({ message: "Failed to update school" });
      }

      res.status(200).json({
        message: "School updated successfully",
        updatedSchool,
      });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  }
);















//get share counts
schoolrouter.get("/:id/shares", async(req, res) => {
    try {
        const { id } = req.params;
    
        const school = await School.findById(id);
    
        if (!school) {
          return res.status(404).json({ message: "School not found" });
        }
        res.status(200).json({ shareCount: school.shares });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
})


//increment share count

schoolrouter.post("/:id/shares", async(req, res) => {
    try {
        const { id } = req.params;
      
        const school = await School.findByIdAndUpdate(
          id,
          { $inc: { shares: 1 } }, 
          { new: true } 
        );
      
        if (!school) {
           return res.status(404).json({ message: "School not found" });
        }
      
        res.status(200).json({ message: "Share count updated.", shareCount: school.shares });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
})

//view more count
//route to increment click count

schoolrouter.post("/:id/click", async(req, res) => {
    try {
        const { id } = req.params;
        const school = await School.findByIdAndUpdate(
          id,
          { $inc: { clicks: 1 } },
          { new: true }
        );
    
        if (!school) {
          return res.status(404).json({ message: "School not found" });
        }
    
        res
          .status(200)
          .json({ message: "Click count updated", clicks: school.clicks });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
})

//get the click count for a specific school
schoolrouter.get("/get-clicks/:id", async(req, res) => {
    try {
        const { id } = req.params;
    
        const school = await School.findById(id);
    
        if (!school) {
          return res.status(404).json({ message: "School not found" });
        }
    
        res.status(200).json({ clicks: school.clicks });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
})



// Get click counts for all schools
schoolrouter.get("/get-clicks", async (req, res) => {
    try {
      const schools = await School.find({}, "schoolName clicks"); // Fetch school name and clicks only
  
      res.status(200).json(schools);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  


  //countSchools

schoolrouter.get("/countSchools", async (req, res) => {
    try {
      const { locations } = req.query;
  
      if (!locations || !Array.isArray(locations)) {
        return res.status(400).json({
          message: "Locations query parameter must be an array of strings",
        });
      }
  
      const counts = await Promise.all(
        locations.map(async (loc) => {
          const count = await School.countDocuments({
            location: { $regex: loc, $options: "i" },
          });
          return { location: loc, count };
        })
      );
  
      res.json(counts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
  


  //comparison

  schoolrouter.get("/schoolscompare", async (req, res) => {
    try {
      const { location, schoolFees, onBoarding, schoolName } = req.query;
  
      // Construct query to match any of the provided search parameters
      const query = [];
  
      if (location && typeof location === "string") {
        query.push({ location: { $regex: location, $options: "i" } });
      }
      if (schoolFees && !isNaN(parseInt(schoolFees))) {
        query.push({ schoolFees: parseInt(schoolFees) });
      }
      if (onBoarding !== undefined) {
        query.push({ onBoarding: JSON.parse(onBoarding.toLowerCase()) });
      }
      if (schoolName && typeof schoolName === "string") {
        query.push({ name: { $regex: name, $options: "i" } });
      }
  
      const schools = await School.find({ $or: query });
      res.json(schools);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
  
  
schoolrouter.get("/comparison", async (req, res) => {
    const { school } = req.query;
    try {
      const school1 = await School.findOne({
        school: new RegExp(`^${school}$`, "i"),
      }); 
      if (school1) {
        res.json(school1);
      } else {
        res.status(404).json({ message: "School not found" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  


  //category count

  schoolrouter.get('/category/counts', async(req, res) => {
    try {
      const categoryCounts = {
        primary: await School.countDocuments({ category: 'primary' }),
        secondary: await School.countDocuments({ category: 'secondary' }),
        college: await School.countDocuments({ category: 'college' }),
        polytechnic: await School.countDocuments({ category: 'polytechnic' }),
        university: await School.countDocuments({ category: 'university' })
      };
  
      res.json(categoryCounts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  
  
  
  
  schoolrouter.get('/location/counts', async (req, res) => {
    try {
  
      const states = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
        'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
        'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
      ];
  
  
      const stateCounts = {};
  
      for (const state of states) {
        const count = await School.countDocuments({ state: state });
        stateCounts[state] = count;
      }
  
  
      res.json(stateCounts);
  
    } catch (error) {
      console.error('Error fetching state counts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  export default schoolrouter
  