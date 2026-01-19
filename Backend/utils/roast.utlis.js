const { PDFParse } = require("pdf-parse")
const fs = require('fs').promises;
const Groq = require('groq-sdk')
const GroqApiKey = process.env.GROQAPIKEY
const resumeRoastsystemPrompt = require("../prompt")
const axios = require('axios')

async function extractTextFromRoastPDF(source, isURL = false) {
  let pdfBuffer;

  if(isURL){
    const response = await axios.get(source, {responseType: 'arraybuffer'})
    pdfBuffer = Buffer.from(response.data)
  }else{
    pdfBuffer = await fs.readFile(source)
  }

  const parser = new PDFParse({data: pdfBuffer})
  const result = await parser.getText()
  return result.text
}

async function resumeRoastText(resumeText){
  const client = new Groq({apiKey:GroqApiKey})

  const chatCompletion = await client.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [
      {role: 'system', content: resumeRoastsystemPrompt},
      {role: 'user', content: `Here is the resume text to roast:\n\n${resumeText}`}
    ],
    temperature: 0.7
  })

  const response = chatCompletion.choices[0]?.message?.content
  return response
}

module.exports = {extractTextFromRoastPDF, resumeRoastText}