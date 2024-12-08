import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Import Navbar component

export default function DecryptFile() {
  const router = useRouter();
  const [decryptionMessage, setDecryptionMessage] = useState("");
  const [decryptedFilePath, setDecryptedFilePath] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false); // New state to track decryption success
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`/api/check-session`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleFileDecryption = async (event) => {
    event.preventDefault();
    const keyword = event.target.key.value;
    if (!keyword) return;

    const { filename } = router.query; // Gather filename from router.query

    const requestBody = {
      key: keyword,
      filename: filename,
    };

    try {
      const response = await fetch(`/api/decrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        console.log("File decrypted successfully");
        setDecryptionMessage(data.message || "File decrypted successfully");
        setDecryptedFilePath(data.downloadLink); // Set the decrypted file path
        setIsDecrypted(true);
      } else {
        const errorData = await response.json();
        console.error("File decryption failed", errorData);
        setDecryptionMessage(errorData.message || "File decryption failed");
        setDecryptedFilePath(""); // Clear the file path on failure
        setIsDecrypted(false); // Set decryption success to false
      }
    } catch (error) {
      console.log("Error decrypting file:", error);
      setDecryptionMessage("Error decrypting file");
      setDecryptedFilePath(""); // Clear the file path on error
      setIsDecrypted(false); // Set decryption success to false
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar isAuthenticated={isAuthenticated} />{" "}
      {/* Pass authentication status to Navbar */}
      <main className="flex flex-col items-center justify-center flex-grow mt-8">
        <form
          onSubmit={handleFileDecryption}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-black">
            Decrypt File: {router.query.filename}
          </h2>
          <input
            type="text"
            name="key"
            placeholder="Enter keyword"
            className="mb-4 w-full border p-2 rounded text-black"
          />
          <button
            type="submit"
            className="bg-blue-500 text-black px-4 py-2 rounded w-full"
          >
            Decrypt
          </button>
        </form>
        {decryptionMessage && (
          <div className="mt-4 text-center text-black">{decryptionMessage}</div>
        )}
        {isDecrypted && (
          <a
            href={decryptedFilePath}
            download
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded"
          >
            Download
          </a>
        )}
      </main>
    </div>
  );
}
