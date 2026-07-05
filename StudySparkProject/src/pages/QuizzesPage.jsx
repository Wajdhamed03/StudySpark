import React, { useState, useEffect } from "react";
import { BookOpen, HelpCircle, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizzesPage() {
  const [questions, setQuestions] = useState([]);
  const [materialTitle, setMaterialTitle] = useState("Study Material");
  const [currentQIndex, setCurrentQIndex] = useState(0); // مؤشر السؤال الحالي
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const currentMaterial = localStorage.getItem("current_material");
    if (currentMaterial) {
      const parsed = JSON.parse(currentMaterial);
      setMaterialTitle(parsed.title || "Study Material");
      
      if (parsed.quiz_questions && parsed.quiz_questions.length > 0) {
        setQuestions(parsed.quiz_questions);
      }
    }
  }, []);

  const handleOptionSelect = (option) => {
    if (showResults) return; 
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQIndex]: option
    });
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    let currentScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        currentScore++;
      }
    });

    setScore(currentScore);
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentQIndex(0);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-1">No quiz found</h2>
        <p className="text-muted-foreground max-w-sm">
          Please upload or paste material first to generate dynamic AI quizzes.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];
  const isLastQuestion = currentQIndex === questions.length - 1;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          <BookOpen className="w-4 h-4" />
          <span>{materialTitle}</span>
        </div>
        <span className="text-sm font-semibold text-purple-600">
          Question {currentQIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Main Container */}
      {!showResults ? (
        <div className="space-y-6">
          {/* Active Question Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex gap-2 leading-relaxed">
                <span className="text-purple-600">{currentQIndex + 1}.</span>
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="grid gap-2.5 pt-2">
                {currentQuestion.options.map((option, oIndex) => {
                  const isSelected = selectedAnswers[currentQIndex] === option;
                  let optionStyle = "border-border hover:bg-muted/40";
                  if (isSelected) optionStyle = "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 font-medium text-purple-700 dark:text-purple-300";

                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleOptionSelect(option)}
                      className={`flex items-center justify-between text-left px-4 py-3.5 border rounded-xl text-sm transition-all ${optionStyle}`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-muted-foreground/30"}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQIndex === 0}
              className="rounded-xl w-24 gap-1 h-11"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmitQuiz}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-md"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="rounded-xl w-24 gap-1 h-11 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center space-y-3 shadow-xl">
            <h3 className="text-2xl font-bold tracking-tight">Quiz Completed! 🎉</h3>
            <p className="text-purple-100 text-sm">
              You scored <span className="text-white font-black text-3xl mx-1">{score}</span> out of <span className="font-bold text-xl">{questions.length}</span>
            </p>
            <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md pt-1">
              Percentage: {Math.round((score / questions.length) * 100)}%
            </div>
          </div>

          {/* Review Answers Sheet */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider px-1">Review Answers:</h4>
            {questions.map((q, index) => {
              const userAns = selectedAnswers[index];
              const isCorrect = userAns === q.correct_answer;

              return (
                <div key={index} className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
                  <h5 className="font-semibold text-sm flex gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    {q.question}
                  </h5>
                  <div className="text-xs space-y-1.5 pt-1">
                    <p className={`flex items-center gap-1.5 p-2 rounded-xl border ${isCorrect ? "bg-emerald-50/40 text-emerald-700 border-emerald-200 dark:bg-emerald-950/10" : "bg-rose-50/40 text-rose-700 border-rose-200 dark:bg-rose-950/10"}`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      <strong>Your Answer:</strong> {userAns}
                    </p>
                    {!isCorrect && (
                      <p className="flex items-center gap-1.5 p-2 rounded-xl border bg-emerald-50/40 text-emerald-700 border-emerald-200 dark:bg-emerald-950/10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <strong>Correct Answer:</strong> {q.correct_answer}
                      </p>
                    )}
                  </div>
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-blue-50/40 dark:bg-blue-950/10 text-xs text-blue-700 dark:text-blue-400 flex gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p><strong>Explanation:</strong> {q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleRetakeQuiz}
            variant="outline"
            className="w-full h-11 rounded-xl gap-2 font-medium"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      )}
    </div>
  );
}