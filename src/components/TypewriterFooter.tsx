import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

const TypewriterFooter = () => {
    const snippets = [
        'print("Hello, Python Heroes!")',
        'def solve_problem(): return "Success"',
        'import data_science as ds',
        'while learning: keep_growing()',
        'neural_net.train(epochs=100)',
        'flask_app.run(debug=True)',
        'pd.read_csv("future.csv")'
    ];

    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % snippets.length;
            const fullText = snippets[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500); // Wait before deleting
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed, snippets]);

    return (
        <div className="h-12 w-full bg-[#0a192f] shrink-0 border-t border-blue-900/50 flex items-center px-4 font-mono text-sm text-green-400 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
            <div className="flex items-center gap-3 w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-2 text-blue-400 opacity-70 select-none">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs">Python 3.11</span>
                    <span className="text-gray-600">|</span>
                </div>
                <div className="flex-1 flex items-center">
                    <span className="text-blue-500 mr-2">{">>>"}</span>
                    <span>{text}</span>
                    <span className="w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 select-none">
                    <span>Ln {Math.floor(text.length / 5) + 1}, Col {text.length + 1}</span>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
};

export default TypewriterFooter;
