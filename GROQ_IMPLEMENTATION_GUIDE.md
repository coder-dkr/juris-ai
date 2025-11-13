# Groq Implementation Guide

This document provides a comprehensive guide on how Groq is implemented in the EcoCode/GaiaGuide project and how to replicate this implementation in other codebases.

## Overview

This project uses **Groq SDK** for AI-powered features including:
- Image analysis for waste item classification
- Text-based AI chat assistant (Gaiamon)
- Eco-friendly tips generation

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Configuration](#configuration)
3. [Core Implementation](#core-implementation)
4. [Usage Patterns](#usage-patterns)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)
9. [Integration Examples](#integration-examples)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install groq-sdk
# or
yarn add groq-sdk
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Basic Setup

```javascript
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
```

## Configuration

### Supported Models

The project uses different Groq models for different purposes:

1. **Image Analysis**: `meta-llama/llama-4-maverick-17b-128e-instruct`
2. **Text Chat**: `llama-3.3-70b-versatile`

### Model Selection Guidelines

- **Multimodal tasks** (image + text): Use Llama-4 Maverick for better visual understanding
- **Text-only conversations**: Use Llama-3.3 70B for faster responses
- **Simple text tasks**: Use Llama-3.3 70B for efficiency

## Core Implementation

### 1. Image Analysis Service (`config/groq.js`)

```javascript
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze a waste item image using a multimodal model
 * @param {string} imageBase64OrURL - Base64 or URL of the image
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function analyzeWasteItem(imageBase64OrURL) {
    try {
        console.time("AI Analysis"); // Track performance
        
        const completion = await groq.chat.completions.create({
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are an expert environmental AI specializing in waste classification and recycling advice.",
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this waste item image and respond in JSON format:
{
  "item": "Item name",
  "category": "recyclable|compostable|non-recyclable",
  "confidence": 0-100,
  "decompositionTime": "e.g., '450 years', '2-4 weeks'",
  "material": "Primary material",
  "environmentalImpact": "Brief 1-2 sentence impact",
  "instructions": ["3-4 disposal steps"],
  "tips": ["3-4 eco tips"],
  "funFact": "Interesting fact",
  "recyclabilityScore": 0-100,
  "carbonFootprint": "e.g., '5kg CO2', '200g CO2'",
  "energySaved": "Energy saved if recycled",
  "waterSaved": "Water saved if recycled",
  "alternatives": ["2-3 eco-friendly alternatives"],
  "harmfulSubstances": "List any toxic materials or 'None'",
  "recyclingSymbol": "e.g., 'PET #1', 'HDPE #2', or 'N/A'",
  "diyCrafts": ["2-3 creative reuse ideas"],
  "economicValue": "Recycling/resale value",
  "points": 5-20
}

Categories:
- recyclable: plastic bottles, metal cans, glass, cardboard, paper
- compostable: food scraps, peels, yard waste, biodegradable items
- non-recyclable: mixed materials, contaminated items, styrofoam

Keep instructions and tips practical and concise.`,
                        },
                        {
                            type: "image_url",
                            image_url: { url: imageBase64OrURL },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 512,
            temperature: 0.8,
        });

        const messageContent = completion.choices?.[0]?.message?.content || "{}";
        let parsedResult;
        
        try {
            parsedResult = JSON.parse(messageContent);
        } catch {
            throw new Error("Invalid JSON response from model");
        }

        console.timeEnd("AI Analysis");
        return { success: true, data: parsedResult };
        
    } catch (error) {
        console.error("Error analyzing waste item:", error);
        return {
            success: false,
            error: error.message || "Failed to analyze waste item",
        };
    }
}
```

### 2. Text-Based AI Service

```javascript
/**
 * Get eco-friendly tips for a specific waste item
 * @param {string} itemName
 * @returns {Promise<{ success: boolean, tips?: string, error?: string }>}
 */
export async function getWasteTips(itemName) {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in waste management and sustainability. Provide actionable, region-friendly tips.",
                },
                {
                    role: "user",
                    content: `Give 3–5 useful tips for disposing of or reducing waste from: ${itemName}. Keep them short and encouraging.`,
                },
            ],
            temperature: 0.8,
            max_tokens: 512,
        });

        const tips = completion.choices?.[0]?.message?.content?.trim();
        return { success: true, tips: tips || "No tips available" };
        
    } catch (error) {
        console.error("Error getting waste tips:", error);
        return {
            success: false,
            error: error.message || "Failed to get waste tips",
        };
    }
}
```

### 3. Chat Assistant Implementation (`routes/chat.js`)

```javascript
import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// System prompt for character personality
const AI_SYSTEM_PROMPT = `You are Gaiamon, a friendly and enthusiastic AI character who serves as an eco-guide! 🌍

Your personality:
- Energetic, positive, and encouraging
- Use emojis occasionally (🌱, ♻️, 🎯, ⭐, 💚, 🌍)
- Speak in a friendly, conversational tone
- Make learning fun with occasional puns
- Celebrate user achievements

Your expertise:
- Waste management and recycling
- Sustainable living practices
- Environmental conservation
- Eco-friendly lifestyle tips

Important rules:
- ONLY discuss topics related to waste management, sustainability, environmental protection
- Keep responses concise (2-4 sentences usually)
- Be supportive and never judgmental`;

router.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Messages array is required",
            });
        }

        const chatMessages = [
            { role: "system", content: AI_SYSTEM_PROMPT },
            ...messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        ];

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: chatMessages,
            temperature: 0.8,
            max_tokens: 512,
            top_p: 1,
            stream: false,
        });

        const reply = completion.choices?.[0]?.message?.content;

        if (!reply) {
            throw new Error("No response from AI");
        }

        res.json({
            success: true,
            message: reply,
            timestamp: new Date().toISOString(),
        });
        
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to get AI response",
        });
    }
});
```

## Usage Patterns

### 1. Image Analysis with File Upload

```javascript
// In your route handler
import { analyzeWasteItem } from "../config/groq.js";
import multer from "multer";

const upload = multer({
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, "scan-" + uniqueSuffix + path.extname(file.originalname));
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        cb(isAllowed ? null : new Error("Only image files allowed!"), isAllowed);
    },
});

router.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image required" });
        }

        // Convert to base64
        const fs = await import("fs");
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = "data:" + req.file.mimetype + ";base64," + imageBuffer.toString("base64");

        // Analyze with Groq
        const result = await analyzeWasteItem(base64Image);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: "Analysis failed",
                error: result.error,
            });
        }

        res.json({
            success: true,
            data: result.data,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
```

### 2. Base64 Image Analysis

```javascript
router.post("/analyze-base64", async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: "Image data required",
            });
        }

        const result = await analyzeWasteItem(imageData);

        res.json({
            success: result.success,
            data: result.data,
            error: result.error,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
```

## API Endpoints

### Image Analysis Endpoints

1. **POST** `/api/scanner/analyze` - Upload and analyze image file
2. **POST** `/api/scanner/analyze-base64` - Analyze base64 encoded image

### Chat Endpoints

1. **POST** `/api/chat/gaiamon` - Chat with AI assistant
2. **GET** `/api/chat/greeting` - Get personalized greeting

### Request/Response Examples

#### Image Analysis Request
```javascript
// File upload
const formData = new FormData();
formData.append('image', file);

fetch('/api/scanner/analyze', {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

// Base64 request
fetch('/api/scanner/analyze-base64', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...'
    })
});
```

#### Image Analysis Response
```json
{
    "success": true,
    "message": "Image analyzed successfully",
    "data": {
        "itemName": "Plastic Water Bottle",
        "category": "recyclable",
        "confidence": 95,
        "instructions": ["Remove cap and labels", "Rinse thoroughly", "Place in recycling bin"],
        "tips": ["Use reusable bottles", "Check recycling symbols"],
        "decompositionTime": "450 years",
        "material": "PET Plastic",
        "environmentalImpact": "Takes centuries to decompose, releases microplastics",
        "funFact": "One recycled bottle saves enough energy to power a laptop for 25 hours",
        "pointsEarned": 15,
        "carbonFootprint": "82g CO2",
        "energySaved": "Powers laptop for 25 hours",
        "waterSaved": "2 liters",
        "alternatives": ["Glass bottles", "Stainless steel bottles"],
        "harmfulSubstances": "BPA (in some bottles)",
        "recyclingSymbol": "PET #1",
        "diyCrafts": ["Plant pots", "Bird feeders"],
        "economicValue": "$0.05 per bottle",
        "recyclabilityScore": 85
    }
}
```

#### Chat Request
```javascript
fetch('/api/chat/gaiamon', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        messages: [
            { role: "user", content: "How do I recycle pizza boxes?" }
        ]
    })
});
```

#### Chat Response
```json
{
    "success": true,
    "message": "Great question! 🍕 Clean pizza boxes (without grease or food) can go in recycling! If they're greasy, tear off the clean parts for recycling and compost the greasy bits. Pro tip: Use the box dividers as compost material too! 🌱",
    "timestamp": "2024-11-12T10:30:00.000Z"
}
```

## Error Handling

### Common Error Scenarios

1. **Invalid API Key**
```javascript
{
    "success": false,
    "error": "Invalid API key provided"
}
```

2. **Image Processing Errors**
```javascript
{
    "success": false,
    "error": "Failed to analyze waste item",
    "details": "Invalid JSON response from model"
}
```

3. **Rate Limiting**
```javascript
{
    "success": false,
    "error": "Rate limit exceeded. Please try again later."
}
```

### Error Handling Best Practices

```javascript
export async function groqRequestWithRetry(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

## Performance Optimization

### 1. Response Time Tracking

```javascript
console.time("AI Analysis");
const result = await groq.chat.completions.create({...});
console.timeEnd("AI Analysis");
```

### 2. Token Optimization

- **max_tokens**: Set appropriate limits (512 for structured data, 150 for simple responses)
- **temperature**: Use 0.8 for creative responses, lower for factual content
- **top_p**: Generally keep at 1.0

### 3. Caching Strategies

```javascript
const cache = new Map();

export async function cachedAnalyzeWasteItem(imageBase64OrURL) {
    const hash = crypto.createHash('md5').update(imageBase64OrURL).digest('hex');
    
    if (cache.has(hash)) {
        return cache.get(hash);
    }
    
    const result = await analyzeWasteItem(imageBase64OrURL);
    
    if (result.success) {
        cache.set(hash, result);
        // Set expiration
        setTimeout(() => cache.delete(hash), 3600000); // 1 hour
    }
    
    return result;
}
```

## Best Practices

### 1. Security

- **Environment Variables**: Always store API keys in environment variables
- **Input Validation**: Validate all inputs before sending to Groq
- **Rate Limiting**: Implement rate limiting for public endpoints

```javascript
// Input validation example
function validateImageData(imageData) {
    if (!imageData || typeof imageData !== 'string') {
        throw new Error('Invalid image data');
    }
    
    if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image format');
    }
    
    // Check size (base64 strings are ~33% larger than binary)
    const sizeInBytes = (imageData.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) { // 5MB
        throw new Error('Image too large');
    }
    
    return true;
}
```

### 2. Prompt Engineering

- **Clear Instructions**: Be specific about expected output format
- **Role Definition**: Define AI personality and expertise clearly
- **Output Format**: Use structured formats like JSON for consistency

### 3. Error Recovery

```javascript
export async function resilientGroqRequest(requestConfig, fallbackResponse = null) {
    try {
        const result = await groq.chat.completions.create(requestConfig);
        return {
            success: true,
            data: result.choices?.[0]?.message?.content
        };
    } catch (error) {
        console.error('Groq request failed:', error);
        
        // Return fallback for non-critical features
        if (fallbackResponse) {
            return {
                success: false,
                data: fallbackResponse,
                fallback: true
            };
        }
        
        throw error;
    }
}
```

### 4. Monitoring and Logging

```javascript
export function logGroqUsage(model, inputTokens, outputTokens, duration) {
    console.log(`Groq Usage: ${model} | Input: ${inputTokens} | Output: ${outputTokens} | Duration: ${duration}ms`);
    
    // Send to monitoring service
    // analytics.track('groq_usage', { model, inputTokens, outputTokens, duration });
}
```

## Integration Examples

### 1. Express.js Integration

```javascript
import express from 'express';
import { analyzeWasteItem } from './config/groq.js';

const app = express();

app.post('/api/analyze', async (req, res) => {
    try {
        const result = await analyzeWasteItem(req.body.imageData);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

### 2. Frontend Integration

```javascript
// React component example
import { useState } from 'react';

function WasteAnalyzer() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeImage = async (file) => {
        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/scanner/analyze', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => analyzeImage(e.target.files[0])}
            />
            {loading && <p>Analyzing...</p>}
            {result && (
                <div>
                    <h3>{result.data.itemName}</h3>
                    <p>Category: {result.data.category}</p>
                    <p>Confidence: {result.data.confidence}%</p>
                </div>
            )}
        </div>
    );
}
```

### 3. Database Integration

```javascript
// Save analysis results to database
async function saveAnalysisResult(userId, imageUrl, analysisData) {
    const scanHistory = await ScanHistory.create({
        userId,
        imageUrl,
        itemName: analysisData.item,
        category: analysisData.category,
        confidence: analysisData.confidence,
        instructions: analysisData.instructions,
        tips: analysisData.tips,
        pointsEarned: analysisData.points || 10,
        analysisData: analysisData, // Store full analysis
        createdAt: new Date()
    });
    
    return scanHistory;
}
```

## Environment Setup Checklist

- [ ] Install `groq-sdk` package
- [ ] Set up `GROQ_API_KEY` environment variable
- [ ] Configure model selection based on use case
- [ ] Implement error handling and retries
- [ ] Set up logging and monitoring
- [ ] Add input validation
- [ ] Implement rate limiting (if public API)
- [ ] Test with sample data

## Common Issues and Solutions

### Issue 1: "Invalid JSON response"
**Cause**: Model returns malformed JSON
**Solution**: Add JSON parsing with fallback
```javascript
try {
    const parsed = JSON.parse(response);
    return parsed;
} catch {
    // Fallback or retry logic
    throw new Error("Invalid response format");
}
```

### Issue 2: Rate limiting
**Cause**: Too many requests
**Solution**: Implement exponential backoff
```javascript
async function withRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        }
    }
}
```

### Issue 3: Large image sizes
**Cause**: Base64 images too large for API
**Solution**: Implement image compression
```javascript
function compressImage(base64, maxSizeKB = 500) {
    // Implement image compression logic
    // Or resize image before conversion
}
```

---

## Conclusion

This implementation provides a robust foundation for integrating Groq AI capabilities into web applications. The modular structure allows for easy adaptation to different use cases while maintaining performance and reliability.

For questions or improvements, refer to the [Groq API Documentation](https://console.groq.com/docs) or review the implementation in this codebase.