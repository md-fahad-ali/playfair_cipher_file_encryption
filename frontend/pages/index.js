import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [showShareableLinkButton, setShowShareableLinkButton] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileName, setFileName] = useState("");

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
        console.log("File uploaded successfully");
        
        console.log(data.fileName);
        setUploadMessage(data.message || "File uploaded successfully");
        setFileName(data.fileName);
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
      <nav className="w-full flex justify-between items-center p-4 bg-white shadow-md">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span className="text-xl font-bold text-black">Software Name</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>
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
            className="mb-4 w-full border p-2 rounded"
          />
          <input
            type="text"
            name="key"
            placeholder="Enter keyword"
            className="mb-4 w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Upload
          </button>
        </form>
        {uploadMessage && (
          <div className="mt-4 text-center text-black">{uploadMessage}</div>
        )}
        {showShareableLinkButton && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => router.push(`/decrypt/${fileName}`)}
          >
            Create Shareable Link
          </button>
        )}
      </main>
    </div>
  );
}
