import { GoogleGenerativeAI } from '@google/generative-ai';

export const suggestTaskDetails = async (title: string, description?: string, projectMembers?: any[]) => {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found!");
    return null;
  }
  
  // Initialize inside function so dotenv has loaded
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const membersList = projectMembers?.map(m => `{ id: "${m.user.id}", name: "${m.user.name}" }`).join(', ') || 'None';
    
    const prompt = `
      You are an AI assistant for a project management tool.
      A new task has been created.
      Title: ${title}
      Description: ${description || 'N/A'}
      Project Members: ${membersList}
      
      Suggest a realistic due date (in ISO format) based on typical complexity (e.g. 2-3 days from now if simple, 1-2 weeks if complex). Assume today is ${new Date().toISOString()}.
      If there are project members, suggest the best assignee's ID based on the task description (or pick randomly if unclear).
      If no members, return null for suggestedAssigneeId.
      
      Respond STRICTLY with JSON: { "dueDate": "ISO_STRING", "suggestedAssigneeId": "ID_OR_NULL" }
      Do not include markdown or extra text.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw AI Response:", text);
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("Clean JSON:", cleanJson);
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return null;
  }
};
