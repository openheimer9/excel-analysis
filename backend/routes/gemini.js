const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');
const path = require('path');
const xlsx = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// API key should be stored securely (use environment variables in production)
const GEMINI_API_KEY = process.env.GEMINI_KEY;

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

router.post('/chat', protect, async (req, res) => {
  try {
    const { fileId, messages } = req.body;

    if (!fileId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    try {
      // 1. Get file metadata from your backend
      const fileMetadataResponse = await axios.get(
        `${req.protocol}://${req.get('host')}/api/files/${fileId}`,
        { headers: { Authorization: req.headers.authorization } }
      );

      const fileData = fileMetadataResponse.data;
      if (!fileData || !fileData.path) {
        return res.status(404).json({ message: 'File metadata not found or missing path.' });
      }

      const fileUrl = fileData.path;
      const originalName = fileData.originalName || fileData.filename || 'file.xlsx';

      // 2. Download the file from Cloudinary (or remote storage)
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(fileResponse.data);

      // 3. If Excel, convert to CSV or plain text
      const fileExtension = path.extname(originalName).toLowerCase();
      let fileContent = null;
      let mimeType = 'text/csv';

      if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        // Parse Excel and convert first sheet to CSV
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        fileContent = xlsx.utils.sheet_to_csv(worksheet);

        // If CSV is empty, fall back to plain text
        if (!fileContent || fileContent.trim() === '') {
          fileContent = xlsx.utils.sheet_to_txt(worksheet);
          mimeType = 'text/plain';
        }
      } else if (fileExtension === '.csv') {
        fileContent = fileBuffer.toString('utf-8');
        mimeType = 'text/csv';
      } else if (fileExtension === '.txt') {
        fileContent = fileBuffer.toString('utf-8');
        mimeType = 'text/plain';
      } else {
        return res.status(400).json({ message: 'Unsupported file type for Gemini.' });
      }

      // 4. Prepare file part for Gemini API
      const filePart = {
        inlineData: {
          data: Buffer.from(fileContent, 'utf-8').toString('base64'),
          mimeType: mimeType
        }
      };

      // 5. Prepare chat history and user message
      const systemInstruction = "You are an AI assistant that helps analyze spreadsheet data. Answer questions about the uploaded file concisely and accurately.";
      const chatHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      }));
      const latestMessage = messages[messages.length - 1].content;

      // 6. Start Gemini chat session
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      // 7. Send system instruction
      await chat.sendMessage(systemInstruction);

      // 8. Send the file and user's latest question together
      const result = await chat.sendMessage([filePart, { text: latestMessage }]);
      const response = await result.response;
      const text = response.text();

      // 9. Format and return the response
      const formattedResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: text
            }
          }
        ]
      };

      res.status(200).json(formattedResponse);

    } catch (fileError) {
      console.error('File error:', fileError.response?.data || fileError.message);
      res.status(404).json({
        message: 'Error processing file',
        error: fileError.response?.data?.message || fileError.message
      });
    }
  } catch (error) {
    console.error('General error:', error.message);
    res.status(500).json({
      message: 'Error processing your request',
      error: error.message
    });
  }
});

module.exports = router;
