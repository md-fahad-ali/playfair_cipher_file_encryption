import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link"; // Import Link from next/link
import Navbar from "./components/Navbar";
export default function Home() {
  const router = useRouter();
  const [showShareableLinkButton, setShowShareableLinkButton] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [downloadLink, setDownloadLink] = useState(""); // State to store download link
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
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
          setIsAuthenticated(true); // Set authentication status to true
        } else {
          setIsAuthenticated(false); // Set authentication status to false
          router.push("/accounts/login");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false); // Set authentication status to false
        router.push("/accounts/login");
      }
    };
    checkSession();
  }, [router]);
  const handleFileUpload = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];
    const keyword = event.target.key.value;
    if (!file || !keyword) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", keyword);
    try {
      const response = await fetch(
        `/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        console.log("File uploaded successfully");
        console.log(data.fileName);
        setUploadMessage(data.message || "File uploaded successfully");
        setFileName(data.fileName);
        setDownloadLink(data.downloadUrl); // Update the download link with the correct URL
        setShowShareableLinkButton(true);
      } else {
        const errorData = await response.json();
        console.error("File upload failed", errorData);
        setUploadMessage(errorData.message || "File upload failed");
      }
    } catch (error) {
      console.log("Error uploading file:", error);
      setUploadMessage("Error uploading file");
    }
  };
  const handleLogout = () => {
    console.log("Logged out");
    router.push("/accounts/login");
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar handleLogout={handleLogout} isAuthenticated={isAuthenticated} />{" "}
      {/* Pass authentication status to Navbar */}
      <main className="flex flex-col items-center justify-center flex-grow mt-8">
        <form
          onSubmit={handleFileUpload}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-black">
            Upload File
          </h2>
          <input
            type="file"
            name="file"
            className="mb-4 w-full border p-2 rounded text-black"
          />
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
            Upload
          </button>
        </form>
        {uploadMessage && (
          <div className="mt-4 text-center text-black">{uploadMessage}</div>
        )}
        {showShareableLinkButton && (
          <>
            <button
              className="bg-green-500 text-black px-4 py-2 rounded mt-4"
              onClick={() => router.push(`/decrypt/${fileName}`)}
            >
              Create Shareable Link
            </button>
            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-black px-4 py-2 rounded mt-4"
            >
              Download File
            </a>
          </>
        )}
        <Link href="/decrypt" className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">
          Decrypt data manually
        </Link>
      </main>
    </div>
  );
}
