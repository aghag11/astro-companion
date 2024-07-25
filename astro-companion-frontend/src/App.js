import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [message, setMessage] = useState('');
    const [responses, setResponses] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Sorry, your browser doesn't support speech recognition.");
        } else {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.continuous = true;
            newRecognition.interimResults = false;

            newRecognition.onstart = () => {
                setIsListening(true);
            };

            newRecognition.onend = () => {
                setIsListening(false);
            };

            newRecognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setMessage(transcript);
            };

            setRecognition(newRecognition);
        }

        //  microphone permissions explicitly
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                console.log("Microphone access granted");
            })
            .catch((error) => {
                console.error("Microphone access denied", error);
                alert("Microphone access is needed for speech recognition to work. Please allow microphone access in your browser settings.");
            });

    }, []);

    const sendMessage = async () => {
        if (message.trim() === '') return;

        const userMessage = { role: 'user', content: message };
        setResponses([...responses, userMessage]);

        try {
            const response = await axios.post('http://localhost:5003/chat', { message });
            const botMessage = { role: 'assistant', content: response.data.reply };
            setResponses([...responses, userMessage, botMessage]);
        } catch (error) {
            console.error('Error communicating with the chatbot', error);
        }

        setMessage('');
    };

    const startListening = () => {
        if (recognition && !isListening) {
            recognition.start();
        }
    };

    return (
        <div className="App">
            <div className="title">Astro-Companion</div>
            <div className="chat-container">
                {responses.map((res, index) => (
                    <div key={index} className={res.role}>
                        {res.content}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <button onClick={startListening} disabled={isListening} className="listen-button">Start Listening</button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;