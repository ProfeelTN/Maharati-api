const Course=require("../../models/course")

async function fetchCourses(){
try {
    const courses = await Course.find();
    return courses;
} catch (error) {
    console.error("Error Fetching Data:", error.message);
    throw new Error("Error Fetching Data")    
}
}
async function fetchCourse(courseID){
    try {
        const course = await Course.findById(courseID);
        return course;
    } catch (error) {
        console.error("Error Fetching Data:", error.message);
        throw new Error("Error Fetching Data")    
    }
    }
module.exports={fetchCourses,fetchCourse};