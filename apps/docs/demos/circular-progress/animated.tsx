"use client";

import { CircularProgress } from "keystoneui/circular-progress";
import { useEffect, useState } from "react";

export default function CircularProgressAnimated() {
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

  return <CircularProgress size="lg" value={value} />;
}
