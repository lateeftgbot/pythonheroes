import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TelegramEntry = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (chatId) {
            console.log("Telegram Entry detected. Chat ID:", chatId);

            // 1. Store the Chat ID in LocalStorage for future signup
            localStorage.setItem("telegram_chat_id", chatId);

            // 2. Notify backend of the visit (optional tracking)
            const userJson = localStorage.getItem("user");
            let email = null;
            if (userJson) {
                try {
                    email = JSON.parse(userJson).email;
                } catch {
                    // Ignore parsing errors
                }
            }

            fetch("/api/track-tg-visit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chatId, email }),
            }).catch(err => console.error("Failed to track TG visit:", err));

            // 3. Instant redirect to the home page (landing page)
            // This removes the chat_id from the URL immediately for the user
            navigate("/", { replace: true });
        } else {
            navigate("/");
        }
    }, [chatId, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground font-mono animate-pulse text-sm">
                    {"// Connecting from Telegram..."}
                </p>
            </div>
        </div>
    );
};

export default TelegramEntry;
