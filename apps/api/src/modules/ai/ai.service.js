const { GoogleGenAI } = require('@google/genai');
const prisma = require('../../config/database');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-api-key' });

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    let systemInstructions = '';
    const isMockFallback = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-api-key';

    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          allocations: { where: { status: 'ACTIVE' }, include: { room: true } },
          payments: { where: { status: 'PENDING' } },
          complaints: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }
        }
      });

      if (!student) {
        return res.status(404).json({ response: "Tenant profile not found." });
      }

      const activeAllocation = student.allocations[0] ? `Room ${student.allocations[0].room.roomNumber}` : 'No active allocation';
      const pendingPaymentsCount = student.payments.length;
      const pendingPaymentsTotal = student.payments.reduce((acc, p) => acc + p.amount, 0);
      const openComplaints = student.complaints.length;

      if (isMockFallback) {
        const msgLower = message.toLowerCase();
        let response = `Hello ${student.firstName}! I am your SmartHostel AI Assistant. How can I help you today?`;
        
        const isRoomQuery = ['room', 'allocation', 'bed', 'floor'].some(keyword => msgLower.includes(keyword));
        const isPaymentQuery = ['payment', 'fee', 'bill', 'due', 'invoice'].some(keyword => msgLower.includes(keyword));
        const isComplaintQuery = ['complaint', 'comlaint', 'issue', 'broken', 'repair', 'leak'].some(keyword => msgLower.includes(keyword));
        const isGeneralQuery = ['what can you do', 'help', 'hello', 'hi'].some(keyword => msgLower.includes(keyword));

        if (isRoomQuery) {
          response = `You are currently allocated to ${activeAllocation}.`;
        } else if (isPaymentQuery) {
          response = `You have ${pendingPaymentsCount} pending payments totaling ₹${pendingPaymentsTotal}.`;
        } else if (isComplaintQuery) {
          response = `You currently have ${openComplaints} open complaints filed with management.`;
        } else if (isGeneralQuery) {
          response = `I can help you check your room allocation, review pending payments or bills, and track your complaints. What would you like to know?`;
        }
        return res.json({ response });
      }

      systemInstructions = `You are a helpful SmartHostel assistant.
Here is the context for the current student chatting with you:
Name: ${student.firstName} ${student.lastName}
Room: ${activeAllocation}
Pending Payments: ${pendingPaymentsCount} (Total: ₹${pendingPaymentsTotal})
Open Complaints: ${openComplaints}

Answer their queries concisely. Be friendly and helpful. Limit to 2 paragraphs.`;

    } else if (role === 'ADMIN' || role === 'WARDEN') {
      const [totalStudents, totalRooms, allocatedRooms, openComplaints] = await Promise.all([
        prisma.student.count(),
        prisma.room.count(),
        prisma.room.count({ where: { status: 'OCCUPIED' } }),
        prisma.complaint.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } })
      ]);

      if (isMockFallback) {
        const msgLower = message.toLowerCase();
        let response = `Hello Staff Member! I am the SmartHostel Admin Assistant. How can I help you manage the hostel?`;
        
        const isTenantQuery = ['student', 'tenant', 'resident', 'occupant'].some(keyword => msgLower.includes(keyword));
        const isRoomQuery = ['room', 'bed', 'floor', 'allocate', 'allocation', 'occupancy'].some(keyword => msgLower.includes(keyword));
        const isComplaintQuery = ['complaint', 'comlaint', 'issue', 'broken', 'repair', 'leak', 'wifi', 'water'].some(keyword => msgLower.includes(keyword));
        const isGeneralQuery = ['what you cn do', 'what can you do', 'help', 'menu', 'features', 'info', 'capabilities', 'hello', 'hi'].some(keyword => msgLower.includes(keyword));

        if (isTenantQuery) {
          response = `There are currently ${totalStudents} registered tenants in the hostel database.`;
        } else if (isRoomQuery) {
          response = `The hostel has ${totalRooms} rooms in total (${allocatedRooms} are currently occupied).`;
        } else if (isComplaintQuery) {
          response = `There are currently ${openComplaints} active unresolved complaints requiring staff action.`;
        } else if (isGeneralQuery) {
          response = `I am your SmartHostel Operations Assistant. Here is what I can do for you:
- **Tenant Statistics**: Ask about registered tenants or students.
- **Room Capacity**: Ask about total rooms, occupancy, or allocations.
- **Complaints**: Ask about active complaints or unresolved maintenance tasks.

How would you like to proceed?`;
        }
        return res.json({ response });
      }

      systemInstructions = `You are a helpful SmartHostel Admin Assistant.
Here is the general hostel status overview for staff reference:
Total Registered Tenants: ${totalStudents}
Total Rooms: ${totalRooms} (Occupied: ${allocatedRooms})
Unresolved Complaints: ${openComplaints}

Help the staff member (Admin/Warden) with stats, tips on managing the hostel, and answering administrative questions. Limit to 2 paragraphs.`;

    } else if (role === 'MESS_MANAGER') {
      const [foodOptionsCount, activeVotes] = await Promise.all([
        prisma.foodOption.count(),
        prisma.foodVote.count({ where: { date: new Date().toISOString().split('T')[0] } })
      ]);

      if (isMockFallback) {
        const msgLower = message.toLowerCase();
        let response = `Hello Mess Manager! I am your Mess Management Assistant. How can I assist with menus or voting today?`;
        
        const isVoteQuery = ['food', 'vote', 'poll', 'choice', 'menu'].some(keyword => msgLower.includes(keyword));
        const isGeneralQuery = ['what can you do', 'help', 'hello', 'hi'].some(keyword => msgLower.includes(keyword));

        if (isVoteQuery) {
          response = `We have received ${activeVotes} votes on food choices for today. There are ${foodOptionsCount} meals available.`;
        } else if (isGeneralQuery) {
          response = `I can help you analyze student voting patterns for the menu, count current votes, or list active food choices. Let me know what you need!`;
        }
        return res.json({ response });
      }

      systemInstructions = `You are a helpful SmartHostel Mess Assistant.
Here is the mess status overview for reference:
Total Food Items: ${foodOptionsCount}
Today's Active Votes: ${activeVotes}

Assist the mess manager with managing meal schedules, answering dietary guidelines, and analyzing voting trends. Limit to 2 paragraphs.`;
    } else {
      return res.status(403).json({ response: "AI Chat is not authorized for your role." });
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstructions + "\n\nUser Message: " + message }] }]
    });

    const botResponse = result.response.text().trim();
    res.json({ response: botResponse });

  } catch (error) {
    console.error("AI Chatbot Error:", error);
    res.status(500).json({ response: "I encountered an error trying to process that. Please try again." });
  }
};

const getPaymentRisk = async (req, res) => {
  const { studentId } = req.params;
  
  const payments = await prisma.payment.findMany({ where: { studentId } });
  
  const overdueCount = payments.filter(p => p.status === 'OVERDUE').length;
  const latePayments = payments.filter(p => p.paidDate && p.paidDate > p.dueDate).length;
  const totalPayments = payments.length;

  const riskScore = totalPayments > 0 
    ? ((overdueCount * 0.6) + (latePayments * 0.4) / totalPayments) * 100 
    : 0;
    
  let aiInsight = "Insufficient data to provide AI insights.";
  
  if (process.env.GEMINI_API_KEY && totalPayments > 0) {
    const prompt = `Analyze this student fee payment history:
Total Payments: ${totalPayments}
Overdue Count: ${overdueCount}
Historically Late Count: ${latePayments}
Calculated Risk Score (0-100): ${riskScore}

Provide a short 1-2 sentence risk assessment to help the admin understand if the student is likely to default on future fees. Keep it professional.`;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const resp = await model.generateContent(prompt);
      aiInsight = resp.response.text();
    } catch (err) {
      console.error("Gemini AI Analytics Error:", err);
    }
  }

  res.json({
    studentId,
    riskLevel: riskScore > 50 ? 'HIGH' : riskScore > 20 ? 'MEDIUM' : 'LOW',
    riskScore: Math.min(100, Math.round(riskScore)),
    factors: { overdueCount, latePayments, totalPayments },
    aiInsight
  });
};

const suggestRoomAllocation = async (req, res) => {
  const { studentId } = req.body;
  
  // Find the student's preferences
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return res.status(404).json({ error: "Student not found" });

  const prefs = typeof student.preferences === 'string' 
    ? JSON.parse(student.preferences) 
    : (student.preferences || {});

  // Find available or partially occupied rooms
  const rooms = await prisma.room.findMany({
    where: { 
      status: { in: ['AVAILABLE'] },
      type: 'DOUBLE'
    },
    take: 5
  });

  if (rooms.length === 0) {
    return res.json({ suggestions: [] });
  }

  if (!process.env.GEMINI_API_KEY) {
      const preferredType = prefs.preferredType || 'DOUBLE';
      const preferredFloor = prefs.preferredFloor;

      return res.json({
        suggestions: rooms.map((r, index) => {
          let score = 70;
          if (r.type === preferredType) score += 15;
          if (preferredFloor && r.roomNumber.startsWith(preferredFloor.toString())) {
            score += 10;
          } else if (index === 0) {
            score += 5;
          }
          return {
            roomId: r.id,
            roomNumber: r.roomNumber,
            compatibilityScore: Math.min(100, score),
            reason: `Deterministic option matching preferences (Room Type: ${r.type}).`
          };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      });
  }

  const prompt = `You are a Smart Hostel recommendation engine.
We are placing Student (ID: ${studentId}) who has these preferences: ${JSON.stringify(prefs)}

Available Rooms:
${rooms.map(r => `- Room Number: ${r.roomNumber}, Type: ${r.type}, Rent: $${r.monthlyRent}, ID: ${r.id}`).join('\n')}

Based on the preferences, pick the best 2 rooms to suggest. Return strictly a JSON array with this structure:
[{"roomId": "UUID", "roomNumber": "101", "compatibilityScore": 85, "reason": "Brief explanation"}]
Do not include any extra text or markdown formatting. Just the JSON array.`;

  try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const resp = await model.generateContent(prompt);
      
      const textResponse = resp.response.text().trim();
      let suggestions = [];
      try {
        // Clean markdown if present
        const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(cleaned);
      } catch(e) {
          console.error("Failed to parse Gemini JSON:", textResponse);
      }
      res.json({ suggestions });
  } catch(err) {
      console.error("Gemini AI Suggestion Error:", err);
      res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

const classifyComplaintAI = async (description) => {
  if (!process.env.GEMINI_API_KEY) return 'OTHER';

  const prompt = `Classify this hostel complaint description into one of these categories: 
PLUMBING, ELECTRICAL, HOUSEKEEPING, SECURITY, FOOD, WIFI, FURNITURE, OTHER.
Also, provide a priority level: LOW, MEDIUM, HIGH, CRITICAL.

Description: "${description}"

Return strictly in JSON format:
{ "category": "CATEGORY", "priority": "PRIORITY" }`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resp = await model.generateContent(prompt);
    const text = resp.response.text().trim();
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini AI Classification Error:", err);
    return null;
  }
};

module.exports = { handleChat, getPaymentRisk, suggestRoomAllocation, classifyComplaintAI };
