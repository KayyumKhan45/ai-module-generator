import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import Editor from "@monaco-editor/react";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import { ImNewTab } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Home = () => {
  const options = [
    { value: "html-css", label: "HTML + CSS" },
    { value: "html-tailwind", label: "HTML + Tailwind CSS" },
    { value: "html-bootstrap", label: "HTML + Bootstrap" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "html-tailwind-bootstrap", label: "HTML + Tailwind + Bootstrap" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  function extractCode(text) {
    if (!text) return "";
    const fenced = text.match(/```(?:html|html\n|)??\n?([\s\S]*?)```/i);
    if (fenced && fenced[1]) return fenced[1].trim();
    const htmlMatch = text.match(/(<html[\s\S]*<\/html>)/i);
    if (htmlMatch) return htmlMatch[1].trim();
    return text.trim();
  }

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  async function getResponse() {
    if (!prompt.trim())
      return toast.error("Please describe your component first");

    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(`
You are an experienced web developer.
Generate a modern, animated, and responsive UI component.

Component description: ${prompt}
Framework: ${frameWork.value}

Return only the full HTML code (no explanations).
    `);

      let text = "";
      if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = result.response.candidates[0].content.parts[0].text;
      } else if (result?.response?.text) {
        text = await result.response.text();
      } else {
        console.log("⚠️ Unknown result structure:", result);
        toast.error("Unexpected response structure");
        return;
      }

      console.log("✅ AI Raw Output:", text);

      text = text
        .replace(/```html/g, "")
        .replace(/```/g, "")
        .replace(/^html\s*/i, "")
        .trim();

      const cleaned = extractCode(text);
      setCode(cleaned);
      setOutputScreen(true);
    } catch (error) {
      console.error("❌ Error generating content:", error);
      toast.error("Something went wrong while generating code");
    } finally {
      setLoading(false);
    }
  }

  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");
    const blob = new Blob([code], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "GeneratedComponent.html";
    link.click();
    toast.success("File downloaded!");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar user={user} setUser={setUser} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-16">
        <div className="w-full py-6 rounded-xl bg-[#141319] mt-5 p-5">
          <h3 className="text-[25px] font-semibold sp-text">
            AI Module Generator
          </h3>
          <p className="mt-2 text-[16px] text-gray-400">
            Describe your component and let AI code it for you.
          </p>

          <p className="text-[15px] font-[700] mt-4">Framework</p>
          <Select
            className="mt-2"
            options={options}
            value={frameWork}
            onChange={(selected) => setFrameWork(selected)}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#111",
                borderColor: "#333",
                color: "#fff",
                boxShadow: "none",
                "&:hover": { borderColor: "#555" },
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#111",
                color: "#fff",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#333"
                  : state.isFocused
                  ? "#222"
                  : "#111",
                color: "#fff",
              }),
            }}
          />

          <p className="text-[15px] font-[700] mt-5">Describe your component</p>
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className="w-full min-h-[200px] rounded-xl mt-3 p-3 placeholder-gray-400 bg-[#09090B] text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Describe your component in detail and AI will generate it..."
          ></textarea>

          <div className="flex items-center justify-between mt-3">
            <p className="text-gray-400 text-sm">
              Click on generate button to get your code
            </p>
            <button
              onClick={getResponse}
              className="flex items-center p-3 rounded-lg border-0 bg-gradient-to-r from-purple-400 to-purple-600 px-5 gap-2 transition-all hover:opacity-80 hover:scale-105 active:scale-95"
            >
              {loading ? <ClipLoader color="white" size={18} /> : <BsStars />}
              Generate
            </button>
          </div>
        </div>

        <div className="relative mt-2 w-full h-[80vh] rounded-xl overflow-hidden bg-[#141319]">
          {!outputScreen ? (
            <div className="w-full h-full flex items-center flex-col justify-center">
              <div className="p-5 w-[70px] flex items-center justify-center text-[30px] h-[70px] rounded-full bg-gradient-to-r from-purple-400 to-purple-600">
                <HiOutlineCode />
              </div>
              <p className="text-[16px] text-gray-400 mt-3">
                Your component & code will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[#17171C] w-full h-[50px] flex items-center gap-3 px-3">
                <button
                  onClick={() => setTab(1)}
                  className={`w-1/2 py-2 rounded-lg transition-all ${
                    tab === 1
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-800 text-gray-300"
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab(2)}
                  className={`w-1/2 py-2 rounded-lg transition-all ${
                    tab === 2
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-800 text-gray-300"
                  }`}
                >
                  Preview
                </button>
              </div>

              <div className="bg-[#17171C] w-full h-[50px] flex items-center justify-between px-4">
                <p className="font-bold text-gray-200">
                  {tab === 1 ? "Code Editor" : "Preview"}
                </p>
                <div className="flex items-center gap-2">
                  {tab === 1 ? (
                    <>
                      <button
                        onClick={copyCode}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <IoCopy />
                      </button>
                      <button
                        onClick={downloadFile}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <PiExportBold />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsNewTabOpen(true)}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <ImNewTab />
                      </button>
                      <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"
                      >
                        <FiRefreshCcw />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="h-full">
                {tab === 1 ? (
                  <Editor
                    value={code}
                    height="100%"
                    theme="vs-dark"
                    language="html"
                  />
                ) : (
                  <iframe
                    key={refreshKey}
                    srcDoc={code}
                    className="w-full h-full bg-white text-black"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isNewTabOpen && (
        <div className="absolute inset-0 bg-white w-screen h-screen overflow-auto">
          <div className="text-black w-full h-[60px] flex items-center justify-between px-5 bg-gray-100">
            <p className="font-bold">Preview</p>
            <button
              onClick={() => setIsNewTabOpen(false)}
              className="w-10 h-10 rounded-xl border border-zinc-300 flex items-center justify-center hover:bg-gray-200"
            >
              <IoCloseSharp />
            </button>
          </div>
          <iframe
            srcDoc={code}
            className="w-full h-[calc(100vh-60px)]"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Home;
