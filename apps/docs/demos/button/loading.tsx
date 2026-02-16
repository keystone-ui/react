"use client";

import { Button } from "keystoneui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

export default function ButtonLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button disabled={isLoading} isLoading={isLoading} onClick={handleClick}>
        Text only
      </Button>
      <Button
        disabled={isLoading}
        isLoading={isLoading}
        onClick={handleClick}
        variant="secondary"
      >
        <Mail />
        Icon left
      </Button>
      <Button
        disabled={isLoading}
        isLoading={isLoading}
        onClick={handleClick}
        variant="outline"
      >
        Icon right
        <ArrowRight />
      </Button>
    </div>
  );
}
