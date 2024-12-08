import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Decrypt() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [decryptMessage, setDecryptMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `/api/check-session`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, [router]);

  const handleFileDecrypt = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];
    const keyword = event.target.key.value;
    if (!file || !keyword) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", keyword);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/decryptfile`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDecryptMessage(data.message || "File decrypted successfully");
        setFileName(data.fileName);
        setDownloadLink(data.downloadLink); // Set the download link from the response
      } else {
        const errorData = await response.json();
        console.error("File decryption failed", errorData);
        setDecryptMessage(errorData.message || "File decryption failed");
      }
    } catch (error) {
      console.log("Error decrypting file:", error);
      setDecryptMessage("Error decrypting file");
    }
  };

  const handleLogout = () => {
    console.log("Logged out");
    router.push("/accounts/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar handleLogout={handleLogout} isAuthenticated={isAuthenticated} />
      <main className="flex flex-col items-center justify-center flex-grow mt-8">
        <form
          onSubmit={handleFileDecrypt}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-black">
            Decrypt File
          </h2>
          <input
            type="file"
            name="file"
            className="mb-4 w-full border p-2 rounded text-black"
          />
          <input
            type="text"
            name="key"
            placeholder="Enter decryption key"
            className="mb-4 w-full border p-2 rounded text-black"
          />
          <button
            type="submit"
            className="bg-blue-500 text-black px-4 py-2 rounded w-full"
          >
            Decrypt
          </button>
        </form>
        {decryptMessage && (
          <div className="mt-4 text-center text-black">{decryptMessage}</div>
        )}
        {downloadLink && (
          <a
            href={downloadLink}
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded"
            download
          >
            Download Decrypted File
          </a>
        )}
      </main>
    </div>
  );
}
