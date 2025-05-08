// import {College} from "../Models/collegeModel.js";

// const getUnUpdatedColleges = async (req, res) => {
//     try {
//         const colleges = await College.find({ metrics: null });
//         const collegeNames = colleges.map(college => college.name);
        
//         // console.log("Unupdated colleges:", colleges);
//         res.status(200).json(collegeNames);
//     } catch (error) {
//         console.error("Error fetching unupdated colleges:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// export { getUnUpdatedColleges };