import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head"; // Import Head from next/head
import Navbar from "../components/Navbar"; 
import axios from "axios";
import FileSaver from "file-saver";

export default function DecryptFile() {
  const router = useRouter();
  const [decryptionMessage, setDecryptionMessage] = useState("");
  const [decryptedFilePath, setDecryptedFilePath] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

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

  const handleDownload = async () => {
    try {
      const response = await axios.get(decryptedFilePath, {
        responseType: "blob", 
      });
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      FileSaver.saveAs(blob, router.query.filename); 
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Playfair Cipher Decrypt</title>
      </Head>
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
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="bg-green-500 text-black px-4 py-2 rounded"
              >
                Download
              </button>
              
              <a
                href={decryptedFilePath}
                className="bg-green-500 text-black px-4 py-2 rounded"
              >
                Download Decrypted File
              </a>
            </div>
        
          )}
        </main>
      </div>
    </>
  );
}
