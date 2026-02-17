"use client";

import { Progress } from "keystoneui/progress";
import { useEffect, useState } from "react";

export default function ProgressAnimated() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return <Progress className="max-w-md" value={value} />;
}
