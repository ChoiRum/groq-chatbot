
require('dotenv').config();
const Groq = require('groq-sdk');
const cors = require('cors');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// CORS 미들웨어 초기화
const corsMiddleware = cors();

const handler = async (req, res) => {
    // CORS 미들웨어를 수동으로 실행
    corsMiddleware(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { messages } = req.body;

        if (!messages) {
            return res.status(400).send('Messages are required');
        }

        try {
            const systemPrompt = {
                role: "system",
                content: "당신은 친절하고 전문적인 신용카드 추천 상담사입니다. 사용자의 소비 습관, 라이프스타일, 선호도에 대한 질문을 통해 최적의 카드 유형을 추천해주세요. 실제 카드 상품명을 직접 언급하는 대신, '주유비 할인을 위한 카드', '온라인 쇼핑에 특화된 캐시백 카드', '항공 마일리지 적립에 유리한 여행 카드'와 같이 카드의 특징과 혜택을 중심으로 설명해야 합니다. 모든 답변은 반드시 한국어로 작성해야 합니다."
            };

            const chatCompletion = await groq.chat.completions.create({
                messages: [systemPrompt, ...messages],
                model: "llama3-8b-8192",
            });

            res.status(200).json(chatCompletion.choices[0].message);
        } catch (error) {
            console.error('Error with Groq API:', error);
            res.status(500).send('Internal Server Error');
        }
    });
};

module.exports = handler;
