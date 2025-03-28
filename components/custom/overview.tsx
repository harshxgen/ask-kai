import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <MessageIcon />
        </p>
        <p>
          This is a custom AI agent powered by XGen Group, designed to provide
          intelligent assistance and seamless interactions.
        </p>
        <p>
          Create a new agent or edit the configuration of an existing AI agent
          by visiting{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://los.xgencredit.com/ai-assistant/agents"
            target="_blank"
          >
            XGen Group AI
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
