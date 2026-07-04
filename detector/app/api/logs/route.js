import { NextResponse } from 'next/server';
import { loggerBus } from '../../../lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const bufferedLogs = loggerBus.getBufferedLogs(sessionId);
      for (const log of bufferedLogs) {
        controller.enqueue(`data: ${JSON.stringify(log)}\n\n`);
      }

      const onLog = (log) => {
        controller.enqueue(`data: ${JSON.stringify(log)}\n\n`);
      };

      loggerBus.subscribe(sessionId, onLog);

      const heartbeatInterval = setInterval(() => {
        controller.enqueue(`:\n\n`);
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        loggerBus.unsubscribe(sessionId, onLog);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
