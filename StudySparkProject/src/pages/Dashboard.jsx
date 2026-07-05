import React, { useState, useEffect } from "react";
import { BookOpen, FileText, CheckCircle2, Clock, ArrowRight, Sparkles, GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  // جلب الملفات المخزنة
  useEffect(() => {
    const savedMaterials = localStorage.getItem("study_materials");
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  // دالة لتحديد الملف الحالي والانتقال للمذاكرة فوراً
  const handleSelectMaterial = (material) => {
    localStorage.setItem("current_material", JSON.stringify(material));
    navigate("/flashcards"); // سينقلك مباشرة للفلاش كاردز الخاصة بهذا الملف!
  };

  // دالة حذف ملف محدد
  const handleDeleteMaterial = (indexToDelete, e) => {
    e.stopPropagation(); // منع انتقال الصفحة عند الضغط على الحذف
    const updated = materials.filter((_, index) => index !== indexToDelete);
    setMaterials(updated);
    localStorage.setItem("study_materials", JSON.stringify(updated));
    
    // إذا كان الملف المحذوف هو النشط حالياً، نمسحه من الكروت النشطة
    const current = localStorage.getItem("current_material");
    if (current) {
      const parsedCurrent = JSON.parse(current);
      if (materials[indexToDelete] && parsedCurrent.title === materials[indexToDelete].title) {
        localStorage.removeItem("current_material");
      }
    }
  };

  const totalMaterials = materials.length;
  const readyMaterials = materials.filter(m => m.status === "Ready").length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-6">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Welcome back to StudySpark
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Ace Your Exams? 🚀
          </h1>
          <p className="text-purple-100 text-sm leading-relaxed">
            Your AI companion is fired up! Click on any material below to open its Flashcards and Quizzes instantly.
          </p>
          <div className="pt-2">
            <Link to="/upload">
              <Button className="bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-semibold px-5 h-11 shadow-md">
                Upload New Material <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Total Materials</p>
          <p className="text-2xl font-bold tracking-tight">{totalMaterials}</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Processed By AI</p>
          <p className="text-2xl font-bold tracking-tight">{readyMaterials}</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Study Sessions</p>
          <p className="text-2xl font-bold tracking-tight">{totalMaterials > 0 ? totalMaterials + 2 : 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">AI Accuracy</p>
          <p className="text-2xl font-bold tracking-tight">99.4%</p>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Recent Materials</h2>
            <p className="text-xs text-muted-foreground">Click on a file to study or click the delete icon to remove it</p>
          </div>
        </div>

        {totalMaterials === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm">No materials found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {materials.map((mat, index) => (
              <div
                key={index}
                onClick={() => handleSelectMaterial(mat)}
                className="flex items-center justify-between p-4 bg-card border rounded-2xl hover:shadow-md cursor-pointer transition-all hover:border-purple-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm capitalize">{mat.title}</h4>
                    <p className="text-xs text-muted-foreground">Subject: {mat.subject || "General"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    Ready
                  </span>
                  {/* زر الحذف الذكي */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDeleteMaterial(index, e)}
                    className="rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 h-9 w-9"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-xl text-purple-600 p-2 h-9 w-9">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}