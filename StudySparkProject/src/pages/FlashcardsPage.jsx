import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FlashcardsPage() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("Study Material");

  useEffect(() => {
    // جلب المادة الحالية التي تم توليدها وحفظها في الـ LocalStorage
    const currentMaterial = localStorage.getItem("current_material");
    if (currentMaterial) {
      const parsed = JSON.parse(currentMaterial);
      setMaterialTitle(parsed.title || "Study Material");
      
      // التأكد من وجود فلاش كاردز داخل البيانات المستلمة من جيميناي
      if (parsed.flashcards && parsed.flashcards.length > 0) {
        setCards(parsed.flashcards);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-1">No flashcards found</h2>
        <p className="text-muted-foreground max-w-sm">
          Please upload or paste a material first to generate dynamic AI flashcards.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted w-fit px-3 py-1 rounded-full">
        <BookOpen className="w-4 h-4" />
        <span>{materialTitle}</span>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Card {currentIndex + 1} of {cards.length}
        </p>
      </div>

      {/* Card Wrapper */}
      <div 
        className="h-72 w-full cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full relative preserve-3d shadow-md rounded-2xl border border-border"
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full bg-card p-6 flex flex-col justify-between rounded-2xl backface-hidden">
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Question</div>
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <h3 className="text-lg font-medium text-foreground">{cards[currentIndex].question}</h3>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="w-3.5 h-3.5" /> Click to flip and see answer
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 flex flex-col justify-between rounded-2xl backface-hidden"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Answer</div>
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <p className="text-base text-foreground font-medium">{cards[currentIndex].answer}</p>
            </div>
            <div className="text-center text-xs text-muted-foreground">Click to flip back</div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-xl w-24 gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        
        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="rounded-xl w-24 gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}