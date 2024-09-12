import { NextResponse } from 'next/server';

let messages: string[] = [];
let clients: ReadableStreamDefaultController<Uint8Array>[] = [];

export async function GET() {
  console.log('GET request received for /api/messages');
  const stream = new ReadableStream({
    start(controller) {
      console.log('New client connected');
      clients.push(controller);

      const encoder = new TextEncoder();
      messages.forEach((msg) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
      });

      console.log(`Sent ${messages.length} existing messages to new client`);
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
      messages = [];
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

    if (!body || typeof body.message !== 'string') {
      console.error('Invalid message format');
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    const { message } = body;
    console.log('Processing message:', message);
    messages.push(message);

    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(
      `data: ${JSON.stringify(message)}\n\n`
    );
    console.log('Sending message to clients:', message);

    clients.forEach((client) => {
      try {
        client.enqueue(encodedMessage);
        console.log('Message enqueued for a client');
      } catch (error) {
        console.error('Error enqueueing message for client:', error);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
