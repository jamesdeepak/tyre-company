const OPENROUTER_API_KEY = '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';
const MODEL = 'microsoft/phi-3-mini-128k-instruct:free'; // Using a free model for demonstration

let knowledgeBase = [];

// Load Knowledge Base
fetch('knowledge-base.json')
    .then(res => res.json())
    .then(data => knowledgeBase = data);

const messagesDiv = document.getElementById('ai-messages');
const inputField = document.getElementById('ai-input');
const sendBtn = document.getElementById('ai-send');

async function handleChat() {
    const userText = inputField.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user');
    inputField.value = '';

    // Advanced RAG logic (Ranked Search)
    const context = findRelevantContext(userText);

    // Check if we have a direct high-quality match to use as an immediate answer or fallback
    const directMatch = knowledgeBase.find(kb =>
        userText.toLowerCase().includes(kb.question.toLowerCase()) ||
        kb.question.toLowerCase().includes(userText.toLowerCase())
    );

    appendMessage('...', 'bot-loading');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href, // Required by some OpenRouter models
                'X-Title': 'Futura Tyres'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are the Futura Tyres AI Assistant. Your goal is to provide accurate, relevant answers based on the provided company context. 
                        
                        RULES:
                        1. Prioritize the information in the 'Context' section.
                        2. If the answer is in the context, use it precisely.
                        3. If the answer is NOT in the context, use your general knowledge to give a professional automotive response, but mention that for specific Futura Tyres details, they should contact support.
                        4. Keep responses concise and helpful.
                        
                        Context:
                        ${context}`
                    },
                    { role: 'user', content: userText }
                ]
            })
        });

        if (!response.ok) throw new Error('API Unavailable');

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        removeLoading();
        appendMessage(botReply, 'bot');
    } catch (err) {
        console.error("Chat Error:", err);
        removeLoading();

        // Robust Fallback: Use direct match or relevant context
        if (directMatch) {
            appendMessage(directMatch.answer, 'bot');
        } else if (context && context !== "No specific company info found.") {
            // Clean up the context string for the user
            const fallbackAnswer = context.split('\nA: ')[1] || context.split('A: ')[1] || context;
            appendMessage(fallbackAnswer, 'bot');
        } else {
            appendMessage("I'm currently in offline mode, but I can tell you that Futura Tyres offers premium solutions for cars, 4x4s, and trucks. How can I help with those?", 'bot');
        }
    }
}

function findRelevantContext(query) {
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return "No specific company info found.";

    const scores = knowledgeBase.map(kb => {
        let score = 0;
        const text = (kb.question + " " + kb.answer).toLowerCase();
        queryWords.forEach(word => {
            if (text.includes(word)) score += 1;
        });
        return { ...kb, score };
    });

    const relevant = scores
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3 relevant matches

    return relevant.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n') || "No specific company info found.";
}

function appendMessage(text, side) {
    const msg = document.createElement('div');
    msg.className = `msg ${side}`;
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return msg;
}

function removeLoading() {
    const loader = document.querySelector('.bot-loading');
    if (loader) loader.remove();
}

sendBtn.addEventListener('click', handleChat);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});

// Suggestion Buttons
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        inputField.value = btn.textContent;
        handleChat();
    });
});
