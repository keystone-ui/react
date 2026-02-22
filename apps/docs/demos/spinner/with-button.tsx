"use client";

import { Button } from "@keystoneui/react/button";
import { Spinner } from "@keystoneui/react/spinner";
import { useState } from "react";

export default function SpinnerWithButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <Button disabled={loading} onClick={handleClick}>
        {loading && <Spinner />}
        {loading ? "Processing..." : "Submit"}
      </Button>
      <Button disabled variant="outline">
        <Spinner />
        Loading...
      </Button>
    </div>
  );
}
