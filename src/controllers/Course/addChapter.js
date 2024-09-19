const courseService = require("../../services/Course/addChapter");

const addChapterToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const chapterData = req.body;
    const files = req.files;

    // Use the service function to handle adding a chapter to the course
    const updatedCourse = await courseService.addChapterToCourse(
      courseId,
      chapterData,
      files
    );

    res
      .status(200)
      .json({ message: "Chapitre ajouté avec succès", course: updatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'ajout du chapitre",
      error: error.message,
    });
  }
};

module.exports = addChapterToCourse;
