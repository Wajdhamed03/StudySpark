import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Clock,
  Layers,
  Brain,
  Target,
  Flame,
  Trophy,
  TrendingUp,
  Calendar
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [progs, sess, cards] = await Promise.all([
          base44.entities.UserProgress.list(),
          base44.entities.StudySession.list("-date", 50),
          base44.entities.Flashcard.list("-created_date", 500),
        ]);
        setProgress(progs[0] || null);
        setSessions(sess);
        setFlashcards(cards);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const accuracy = progress?.total_answers > 0
    ? Math.round((progress.total_correct_answers / progress.total_answers) * 100)
    : 0;
  const studyHours = Math.round((progress?.total_study_minutes || 0) / 60 * 10) / 10;

  // Card status distribution
  const cardStats = {
    new: flashcards.filter(fc => fc.status === "new").length,
    know_it: flashcards.filter(fc => fc.status === "know_it").length,
    review_later: flashcards.filter(fc => fc.status === "review_later").length,
    difficult: flashcards.filter(fc => fc.status === "difficult").length,
  };
  const pieData = [
    { name: "New", value: cardStats.new },
    { name: "Know It", value: cardStats.know_it },
    { name: "Review", value: cardStats.review_later },
    { name: "Difficult", value: cardStats.difficult },
  ].filter(d => d.value > 0);

  // Recent sessions for bar chart
  const sessionsByDay = {};
  sessions.forEach(s => {
    const d = s.date;
    if (!sessionsByDay[d]) sessionsByDay[d] = { date: d, minutes: 0, quizzes: 0 };
    sessionsByDay[d].minutes += s.duration_minutes || 0;
    if (s.session_type === "quiz") sessionsByDay[d].quizzes += 1;
  });
  const barData = Object.values(sessionsByDay).slice(0, 7).reverse();

  // Badges
  const badges = [];
  if ((progress?.current_streak || 0) >= 3) badges.push({ name: "3-Day Streak", icon: Flame });
  if ((progress?.current_streak || 0) >= 7) badges.push({ name: "Week Warrior", icon: Trophy });
  if ((progress?.total_quizzes_completed || 0) >= 5) badges.push({ name: "Quiz Master", icon: Brain });
  if ((progress?.total_flashcards_created || 0) >= 50) badges.push({ name: "Card Collector", icon: Layers });
  if (accuracy >= 80) badges.push({ name: "Sharp Mind", icon: Target });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground mt-1">Track your study performance over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Study Hours" value={studyHours} color="from-purple-500 to-purple-600" />
        <StatCard icon={Layers} label="Flashcards" value={progress?.total_flashcards_created || 0} color="from-blue-500 to-blue-600" />
        <StatCard icon={Brain} label="Quizzes Done" value={progress?.total_quizzes_completed || 0} color="from-indigo-500 to-indigo-600" />
        <StatCard icon={Target} label="Accuracy" value={`${accuracy}%`} color="from-emerald-500 to-emerald-600" />
      </div>

      {/* Streak & Daily Goal */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white"
        >
          <Flame className="w-8 h-8 mb-2" />
          <p className="text-4xl font-bold">{progress?.current_streak || 0} days</p>
          <p className="text-white/80 text-sm mt-1">Current Streak</p>
          <p className="text-white/60 text-xs mt-2">Longest: {progress?.longest_streak || 0} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <Calendar className="w-6 h-6 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Daily Goal</h3>
          <p className="text-3xl font-bold">{progress?.daily_goal_minutes || 30} min</p>
          <p className="text-sm text-muted-foreground mt-1">Keep studying to maintain your streak!</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Activity chart */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Study Activity
          </h3>
          {barData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 12%, 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(240, 6%, 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(240, 6%, 46%)" />
                <Tooltip />
                <Bar dataKey="minutes" fill="hsl(252, 85%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Flashcard distribution */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Card Status
          </h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No flashcards yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Badges</h3>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keep studying to earn badges!</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.map(b => (
              <motion.div
                key={b.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-card rounded-xl border border-border px-4 py-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <b.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{b.name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}