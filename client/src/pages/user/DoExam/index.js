import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getExamById } from "../../../apicalls/exam";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import Instruction from "./instruction";
import { addReport } from "../../../apicalls/reports";

function DoExam() {
  const [examData, setExamData] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = React.useState(0);
  const [selectedOptions, setSelectedOptions] = React.useState({});
  const [result, setResult] = React.useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [view, setView] = React.useState("instruction");
  const [secondsLeft = 0, setSecondsLeft] = React.useState(0);
  const [timeup, setTimeup] = React.useState(false);
  const [intervalId, setIntervalId] = React.useState(null);
  const { user } = useSelector((state) => state.users);

  const params = useParams();
  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({
        examId: params.id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setQuestions(response.data.questions);
        setExamData(response.data);
        setSecondsLeft(response.data.duration);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const calculateResult = async () => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];

      questions.forEach((question, index) => {
        if (question.correctOption === selectedOptions[index]) {
          correctAnswers.push(question);
        } else {
          wrongAnswers.push(question);
        }
      });

      let verdict = "Pass";
      if (wrongAnswers.length > examData.passingMarks) {
        verdict = "Fail";
      }

      const tempResult = {
        correctAnswers,
        wrongAnswers,
        verdict,
      };
      setResult(tempResult);
      dispatch(ShowLoading());
      const response = await addReport({
        exam: params.id,
        result: tempResult,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        // message.success(response.message);
        setView("result");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const startTimer = () => {
    let totalSeconds = examData.duration;
    const intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds);
      } else {
        setTimeup(true);
      }
    }, 1000);
    setIntervalId(intervalId);
  };

  useEffect(() => {
    if (timeup && view === "questions") {
      clearInterval(intervalId);
      calculateResult();
    }
  }, [timeup]);

  useEffect(() => {
    if (params.id) {
      getExamData();
    }
  }, []);

  return (
    examData && (
      <div className="mt-2">
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instruction" && (
          <Instruction
            examData={examData}
            view={view}
            setView={setView}
            startTimer={startTimer}
          />
        )}

        {/* Questions view */}
        {view === "questions" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-2xl">
                {selectedQuestionIndex + 1}:{" "}
                {questions[selectedQuestionIndex].name}
              </h1>

              <div className="timer">
                <span className="text-2xl">{secondsLeft}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {Object.keys(questions[selectedQuestionIndex].options).map(
                (option, index) => {
                  return (
                    <div
                      className={`flex flex-col gap-2 items-center ${
                        selectedOptions[selectedQuestionIndex] === option
                          ? "selected-option"
                          : "option"
                      }`}
                      key={index}
                      onClick={() => {
                        setSelectedOptions({
                          ...selectedOptions,
                          [selectedQuestionIndex]: option,
                        });
                      }}
                    >
                      <h1 className="text-xl">
                        {option}:{" "}
                        {questions[selectedQuestionIndex].options[option]}
                      </h1>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex justify-between">
              {/* Previous Button */}
              {selectedQuestionIndex > 0 && (
                <button
                  className="primary-outlined-btn"
                  onClick={() => {
                    if (selectedQuestionIndex > 0) {
                      setSelectedQuestionIndex(selectedQuestionIndex - 1);
                    }
                  }}
                >
                  Previous
                </button>
              )}

              {/* Next Button */}
              {selectedQuestionIndex < questions.length - 1 && (
                <button
                  className="primary-contained-btn"
                  onClick={() => {
                    if (selectedOptions[selectedQuestionIndex] === undefined) {
                      message.error("Please select an option");
                    } else {
                      setSelectedQuestionIndex(selectedQuestionIndex + 1);
                    }
                  }}
                >
                  Next
                </button>
              )}

              {/* Submit Button */}
              {selectedQuestionIndex === questions.length - 1 && (
                <button
                  className="primary-contained-btn"
                  onClick={() => {
                    clearInterval(intervalId);
                    setTimeup(true);
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}

        {view === "result" && (
          <div className="flex items-center mt-2 justify-center result">
            <div className="flex flex-col gap-2 ">
              <h1 className="text-2xl">RESULT</h1>
              <div className="divider"></div>
              <div className="marks">
                <h1 className="text-md">Total Marks: {examData.totalMarks}</h1>
                <h1 className="text-md">
                  Passing Marks: {examData.passingMarks}
                </h1>
                <h1 className="text-md">
                  Obtained Marks: {result.correctAnswers.length}
                </h1>
                <h1 className="text-md">Verdict: {result.verdict}</h1>

                <div className="flex gap-2 mt-2">
                  {/* <button
                    className="primary-outlined-btn"
                    onClick={() => {
                      setView("instructions");
                      setSelectedQuestionIndex(0);
                      setSelectedOptions({});
                      setSecondsLeft(examData.duration);
                    }}
                  >
                    Retake Exam
                  </button> */}
                  <button
                    className="primary-outlined-btn"
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    Close
                  </button>

                  <button
                    className="primary-contained-btn"
                    onClick={() => {
                      setView("review");
                    }}
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            </div>
            <div className="lottie-animation">
              {result.verdict === "Pass" && (
                <dotlottie-player
                  src="https://lottie.host/d0f932a8-18ad-42ec-ad28-b37ba988280c/D26lQEdmv7.json"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                ></dotlottie-player>
              )}

              {result.verdict === "Fail" && (
                <dotlottie-player
                  src="https://lottie.host/fb6bc985-27ce-438c-be8a-1e712a533ac1/BSHl3JUyIZ.json"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                ></dotlottie-player>
              )}
            </div>
          </div>
        )}

        {view === "review" && (
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => {
              const isCorrect =
                question.correctOption === selectedOptions[index];
              return (
                <div
                  className={`
                flex flex-col gap-1 p-2 ${isCorrect ? "bg-success" : "bg-error"}
                `}
                >
                  <h1 className="text-xl">
                    {index + 1}: {question.name}{" "}
                  </h1>
                  <h1 className="text-md">
                    Your Answer: {selectedOptions[index]} -{" "}
                    {question.options[selectedOptions[index]]}
                  </h1>
                  <h1 className="text-md">
                    Correct Answer: {question.correctOption} -{" "}
                    {question.options[question.correctOption]}
                  </h1>
                </div>
              );
            })}
            <div className="flex justify-center gap-2">
              <button
                className="primary-outlined-btn"
                onClick={() => {
                  navigate("/");
                }}
              >
                Close
              </button>
              {/* <button
                className="primary-contained-btn"
                onClick={() => {
                  setView("result");
                  setSelectedQuestionIndex(0);
                  setSelectedOptions({});
                  setSecondsLeft(examData.duration);
                }}
              >
                Retake Exam
              </button> */}
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default DoExam;
