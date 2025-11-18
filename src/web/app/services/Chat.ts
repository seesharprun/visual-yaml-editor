import {
  ChatRequestHandler,
  ChatRequest,
  ChatContext,
  ChatResponseStream,
  CancellationToken,
  ChatResult,
  LanguageModelChatMessage,
  LanguageModelChatResponse,
  l10n,
  LanguageModelError,
  TelemetryLogger,
  env
} from 'vscode';

/**
  * Chat request handler for the extension.
  * This handler processes chat requests and generates appropriate responses.
  */
export const ChatHandler: ChatRequestHandler = async (
  request: ChatRequest,
  context: ChatContext,
  stream: ChatResponseStream,
  token: CancellationToken
): Promise<IExtendedChatResult> => {

  // Greet user
  stream.progress('Starting...');
  stream.markdown('Hello from MQL YAML!');
  stream.markdown('---');

  try {
    // Generate random single digit numbers
    const left: number = Math.floor(Math.random() * 9) + 1;
    const right: number = Math.floor(Math.random() * 9) + 1;

    // Inform user
    stream.markdown('I am now going to ask the underlying AI model a question.');
    stream.markdown('The question I will ask is:');
    stream.markdown(`
    \`\`\`markdown
    What is ${left} + ${right}?
    \`\`\`
    `);

    // Generate and ask the model a question
    stream.progress('Asking question...');
    const messages = [
      LanguageModelChatMessage.User(`What is ${left} + ${right}?`)
    ];
    const response: LanguageModelChatResponse = await request.model.sendRequest(
      messages,
      {},
      token);

    // Returning response to user
    stream.progress('Getting response...');
    for await (const fragment of response.text) {
      stream.markdown(fragment);
    }
  } catch (err) {
    // Handle any errors that occur during the chat request
    handleError(logger, err, stream);
  }

  // Return metadata about the command executed
  return { metadata: { command: 'generic-use' } };
};

// Extended chat result interface to include metadata
interface IExtendedChatResult extends ChatResult {
  metadata: {
    command: string;
  }
}

const logger = env.createTelemetryLogger({
  sendEventData(eventName, data) {
    // Capture event telemetry
    console.log(`Event: ${eventName}`);
    console.log(`Data: ${JSON.stringify(data)}`);
  },
  sendErrorData(error, data) {
    // Capture error telemetry
    console.error(`Error: ${error}`);
    console.error(`Data: ${JSON.stringify(data)}`);
  }
});

// making the chat request might fail because
// - model does not exist
// - user consent not given
// - quote limits exceeded
function handleError(logger: TelemetryLogger, err: unknown, stream: ChatResponseStream): void {
  if (err instanceof Error) {
    logger.logError(err);
  }
  if (err instanceof LanguageModelError) {
    console.log(err.message, err.code);
    if (err instanceof Error && err.message.includes('off_topic')) {
      stream.markdown(l10n.t('I\'m sorry, I can only explain computer science concepts.'));
    }
  } else {
    // re-throw other errors so they show up in the UI
    throw err;
  }
}