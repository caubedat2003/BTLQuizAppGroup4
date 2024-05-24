const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel");

// Add exam
router.post("/add", authMiddleware, async (req, res) => {
  try {
    // check if exam already exists
		const examExist = await Exam.findOne({ name: req.body.name });
		if(examExist) {
			return res.status(200).send({
				message: "Exam already exists",
				success: false
			})
		}

		req.body.questions = [];
		// add new exam
		const newExam = new Exam(req.body);
		await newExam.save();
		res.send({
			message: "Exam added successfully",
			success: true
		});
  } catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
})

// Get all exams
router.post("/get-all-exams", authMiddleware, async (req, res) => {
	try {
		const exams = await Exam.find({});
		res.send({
			message: "Exams fetched successfully",
			data: exams,
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});

// Get exam by id
router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
	try {
		const exam = await Exam.findById(req.body.examId).populate("questions");
		res.send({
			message: "Exam fetched successfully",
			data: exam,
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});

// Edit exam by id
router.post("/edit-exam-by-id", authMiddleware, async (req, res) => {
	try {
		await Exam.findByIdAndUpdate(req.body.examId, req.body);
		res.send({
			message: "Exam updated successfully",
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});


// Delete exam by id
router.post("/delete-exam-by-id", authMiddleware, async (req, res) => {
	try {
		await Exam.findByIdAndDelete(req.body.examId);
		res.send({
			message: "Exam deleted successfully",
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});

// Add question to exam
router.post("/add-question-to-exam", authMiddleware, async (req, res) => {
	try {
		// Add questions to database
		const newQuestion = new Question(req.body);
		const question = await newQuestion.save();

		// Add question to exam
		const exam = await Exam.findById(req.body.exam);
		exam.questions.push(question._id);
		await exam.save();
		res.send({
			message: "Question added to exam successfully",
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});

// Edit question in exam
router.post("/edit-question-in-exam", authMiddleware, async (req, res) => {
	try {
		await Question.findByIdAndUpdate(req.body.questionId, req.body);
		res.send({
			message: "Question updated successfully",
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});

// Delete question from exam
router.post("/delete-question-from-exam", authMiddleware, async (req, res) => {
	try {
		// delete question from database
		await Question.findByIdAndDelete(req.body.questionId);

		// delete question from exam
		const exam = await Exam.findById(req.body.examId);
		exam.questions = exam.questions.filter(
			(question) => question._id != req.body.questionId
		);
		await exam.save();
		res.send({
			message: "Question deleted from exam successfully",
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: error.message,
			data: error,
			success: false
		});
	}
});




module.exports = router;