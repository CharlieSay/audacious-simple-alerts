// app/api/messages/route.ts
import { NextResponse } from 'next/server';

interface QueuedMessage {
  id: string;
  message: string;
  timestamp: number;
  sender: string;
}

let messageQueue: QueuedMessage[] = [];
let currentMessageIndex = 0;
let clients: ReadableStreamDefaultController<Uint8Array>[] = [];

export async function GET() {
  console.log('GET request received for /api/messages');
  const stream = new ReadableStream({
    start(controller) {
      console.log('New client connected');
      clients.push(controller);

      // Send current message to the new client if exists
      if (messageQueue.length > 0) {
        const encoder = new TextEncoder();
        const currentMessage = messageQueue[currentMessageIndex];
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(currentMessage)}\n\n`)
        );
      }
    },
    cancel() {
      console.log('Client disconnected');
      clients = clients.filter((client) => client !== this);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  console.log('POST request received for /api/messages');
  try {
    const body = await req.json();
    console.log('Received body:', body);

    if (body.action === 'clear') {
      console.log('Clearing screen');
      messageQueue = [];
      currentMessageIndex = 0;
      const encoder = new TextEncoder();
      const clearMessage = encoder.encode(`data: CLEAR_SCREEN\n\n`);
      clients.forEach((client) => {
        try {
          client.enqueue(clearMessage);
          console.log('Clear screen message enqueued for a client');
        } catch (error) {
          console.error(
            'Error enqueueing clear screen message for client:',
            error
          );
        }
      });
      return NextResponse.json({ success: true, action: 'clear' });
    }

    if (
      !body ||
      typeof body.message !== 'string' ||
      typeof body.sender !== 'string'
    ) {
      console.error('Invalid message format');
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const { message, sender } = body;
    console.log('Processing message:', message, 'from', sender);

    const newMessage: QueuedMessage = {
      id: Date.now().toString(),
      message,
      timestamp: Date.now(),
      sender,
    };
    messageQueue.push(newMessage);

    if (messageQueue.length === 1) {
      // If this is the first message, send it immediately
      sendNextMessage();
    }

    return NextResponse.json({
      success: true,
      queuePosition: messageQueue.length - 1,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function sendNextMessage() {
  if (currentMessageIndex < messageQueue.length) {
    const encoder = new TextEncoder();
    const message = messageQueue[currentMessageIndex];
    const encodedMessage = encoder.encode(
      `data: ${JSON.stringify(message)}\n\n`
    );

    clients.forEach((client) => {
      try {
        client.enqueue(encodedMessage);
        console.log('Message enqueued for a client');
      } catch (error) {
        console.error('Error enqueueing message for client:', error);
      }
    });

    currentMessageIndex++;

    setTimeout(sendNextMessage, 1500);
  }
}
