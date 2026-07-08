import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Type,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function UploadPage() {
  const [mode, setMode] = useState("file"); // file | paste
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("upload"); // upload | processing | done
  const [materials, setMaterials] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // استرجاع المواد المحفوظة في الجهاز من قبل لتظهر في القائمة
  useEffect(() => {
    const saved = localStorage.getItem("study_materials");
    if (saved) setMaterials(JSON.parse(saved));
  }, [step]); // تحديث القائمة فوراً عند تغير حالة الرفع

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    if (mode === "file" && !file) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }
    if (mode === "paste" && !pastedText.trim()) {
      toast({ title: "Please paste some text", variant: "destructive" });
      return;
    }

    setProcessing(true);
    setStep("processing");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subject", subject.trim() || "General");

      if (mode === "file") {
        formData.append("file", file);
      } else {
        formData.append("text", pastedText);
      }

      // استدعاء السيرفر الحقيقي الخاص بكِ على بورت 5000!
     const response = await fetch("https://studyspark-yh07.onrender.com/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const aiResult = await response.json();

      // تجهيز كائن المادة الجديدة وحفظه محلياً ليعمل التطبيق بالكامل بشكل منفصل
      const newMaterial = {
        id: Date.now().toString(),
        title: title.trim(),
        subject: subject.trim() || "General",
        status: "Ready",
        is_processed: true,
        ...aiResult
      };

      // جلب القائمة المحدثة بدقة لمنع الكتابة فوق الملفات القديمة
      const currentSaved = localStorage.getItem("study_materials");
      const currentList = currentSaved ? JSON.parse(currentSaved) : [];

      // إلحاق المادة الجديدة في أول القائمة
      const updatedMaterials = [newMaterial, ...currentList];
      
      // حفظ البيانات في الـ localStorage
      localStorage.setItem("study_materials", JSON.stringify(updatedMaterials));
      localStorage.setItem("current_material", JSON.stringify(newMaterial));
      
      setMaterials(updatedMaterials);
      setStep("done");
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong", description: "Please make sure your backend server is running.", variant: "destructive" });
      setStep("upload");
    }
    setProcessing(false);
  };

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Generating study content...</h2>
        <p className="text-muted-foreground max-w-md">
          Our AI Gemini is currently analyzing your material and creating flashcards, quizzes, and summaries. This usually takes 5-15 seconds.
        </p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Content Generated!</h2>
        <p className="text-muted-foreground mb-6">Your flashcards, quizzes, and summary are ready to study.</p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/flashcards")} className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            Study Flashcards
          </Button>
          <Button onClick={() => navigate("/quizzes")} variant="outline" className="rounded-xl">
            Take Quiz
          </Button>
          <Button onClick={() => { setStep("upload"); setFile(null); setPastedText(""); setTitle(""); setSubject(""); }} variant="ghost" className="rounded-xl">
            Upload More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Study Material</h1>
        <p className="text-muted-foreground mt-1">Upload a file or paste text and AI will generate flashcards, quizzes, and more.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-muted rounded-xl p-1 w-fit">
        <button
          onClick={() => setMode("file")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "file" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "paste" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
          }`}
        >
          <Type className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* Title & Subject */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Title *</label>
          <Input
            placeholder="e.g. Chapter 5 - Cell Biology"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Subject</label>
          <Input
            placeholder="e.g. Biology"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {mode === "file" ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-2">
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, TXT, or images up to 25MB</p>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Textarea
              placeholder="Paste your lecture notes, textbook content, or any study material here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[200px] rounded-xl resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">{pastedText.length} characters</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleUpload}
        disabled={processing}
        className="w-full rounded-xl h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-base"
      >
        {processing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Study Content
          </>
        )}
      </Button>

      {/* Recent Materials */}
      {materials.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Your Materials</h3>
          <div className="space-y-2">
            {materials.map((mat) => (
              <div key={mat.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{mat.title}</p>
                  <p className="text-xs text-muted-foreground">{mat.subject}</p>
                </div>
                {mat.is_processed && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">Ready</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
