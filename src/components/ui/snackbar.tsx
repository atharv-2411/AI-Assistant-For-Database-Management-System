import { useEffect, useState } from "react";

export default function Snackbar() {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000); // Auto-hide after 5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-500 text-black px-4 py-2 rounded shadow-lg text-lg font-bold z-50 transition-opacity duration-1000 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      ⚠️ Trino connection and execution is yet to be implemented
    </div>
  );
}
