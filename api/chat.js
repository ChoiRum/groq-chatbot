import Groq from 'groq-sdk';
import cors from 'cors';

// Vercel 환경에서는 .env를 사용하지 않지만, 로컬 테스트를 위해 dotenv를 유지할 수 있습니다.
// import dotenv from 'dotenv';
// dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// CORS 미들웨어 초기화
const corsMiddleware = cors();

// Vercel의 서버리스 함수는 req, res를 인자로 받습니다.
const handler = (req, res) => {
    // CORS 미들웨어를 수동으로 실행
    corsMiddleware(req, res, async () => {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        const { messages } = req.body;

        if (!messages) {
            return res.status(400).json({ error: 'Messages are required' });
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
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

export default handler;