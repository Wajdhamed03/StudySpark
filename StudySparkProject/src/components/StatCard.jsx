import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, sublabel, color = "from-purple-500 to-blue-500" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>}
      </div>
    </motion.div>
  );
}