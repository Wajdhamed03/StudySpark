import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { User, Clock, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const [u, progs] = await Promise.all([
        base44.auth.me(),
        base44.entities.UserProgress.list(),
      ]);
      setUser(u);
      if (progs[0]) {
        setProgress(progs[0]);
        setDailyGoal(progs[0].daily_goal_minutes || 30);
      }
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    load();
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const saveGoal = async () => {
    if (progress) {
      await base44.entities.UserProgress.update(progress.id, { daily_goal_minutes: dailyGoal });
    } else {
      await base44.entities.UserProgress.create({ daily_goal_minutes: dailyGoal });
    }
    toast({ title: "Settings saved!" });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold">{user?.full_name || "Student"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Study Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5 space-y-5"
      >
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Study Preferences
        </h3>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Daily Study Goal (minutes)</label>
          <div className="flex gap-3">
            <Input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="rounded-xl w-32"
              min={5}
              max={480}
            />
            <Button onClick={saveGoal} className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              Save
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5"
      >
        <h3 className="font-semibold mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm font-medium">Dark Mode</span>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>
      </motion.div>
    </div>
  );
}