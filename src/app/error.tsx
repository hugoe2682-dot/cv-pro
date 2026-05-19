"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#8b5cf6] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter mb-6 uppercase">
        Error
      </h1>
      
      <p className="text-white text-xl sm:text-3xl font-medium tracking-wide">
        you look like under the influance
      </p>
    </div>
  );
}
