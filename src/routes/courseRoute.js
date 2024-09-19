const router = require("express").Router();

const { createCourse } = require("../controllers/Course/createCourse");
const { updateCourse } = require("../controllers/Course/updateCourse");
const { deleteCourse } = require("../controllers/Course/deleteCourse");
const {
  fetchCourses,
  fetchCourse,
} = require("../controllers/Course/coursesFetch");
const authMiddleware = require("../utils/authMiddleware");
const addChapter = require("../controllers/Course/addChapter");
const { verifyRole, ROLES } = require("../utils/VerifyRole");

const upload = require("../utils/multerConfig");
const { addQuizToChapter } = require("../controllers/Course/quizController");

router.post(
  "/new",
  authMiddleware.authenticateToken,
  verifyRole(ROLES.ADMIN, ROLES.INSTRUCTOR),
  createCourse
);
router.put(
  "/update/:id",
  authMiddleware.authenticateToken,
  verifyRole(ROLES.ADMIN, ROLES.INSTRUCTOR),
  updateCourse
);
router.delete(
  "/delete/:id",
  authMiddleware.authenticateToken,
  verifyRole(ROLES.ADMIN, ROLES.INSTRUCTOR),
  deleteCourse
);
router.get("/", fetchCourses);
router.get("/:id", authMiddleware.authenticateToken, fetchCourse);
router.post("/:courseId/chapters", upload.array("files"), addChapter);
router.post("/:courseId/chapters/:chapterId/quiz", addQuizToChapter);

module.exports = router;
