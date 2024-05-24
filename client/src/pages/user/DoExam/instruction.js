import React from "react";
import { useNavigate } from "react-router-dom";

function Instruction({ examData, view, setView, startTimer }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-5">
      <ul className="flex flex-col gap-1">
        <h1 className="text-2xl">Instructions</h1>
        <li>Duration: {examData.duration} seconds</li>
        <li>Automatically submit after {examData.duration} seconds</li>
        <li>Cannot change answer after submit</li>
        <li>
          You can use the <span className="font-bold">"Previous"</span> and{" "}
          <span className="font-bold">"Next"</span> buttons to navigate between
          questions.
        </li>
        <li>
          Total marks of the exam is{" "}
          <span className="font-bold">{examData.totalMarks}</span>.
        </li>
        <li>
          Passing marks of the exam is{" "}
          <span className="font-bold">{examData.passingMarks}</span>.
        </li>
      </ul>
      <div className="flex gap-2">
        <button className="primary-outlined-btn"
          onClick={() => {
            navigate("/");
          }}
        >CLOSE</button>
        <button
          className="primary-contained-btn"
          onClick={() => {
            startTimer();
            setView("questions");
          }}
        >
          START
        </button>
      </div>
    </div>
  );
}

export default Instruction;
