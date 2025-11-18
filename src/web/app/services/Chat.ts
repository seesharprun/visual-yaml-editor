import {
  ChatRequestHandler,
  ChatRequest,
  ChatContext,
  ChatResponseStream,
  CancellationToken,
  ChatResult,
  LanguageModelChatMessage,
  l10n,
  LanguageModelError,
  env,
  window,
  workspace,
  WorkspaceEdit,
  Uri,
  ChatRequestTurn,
  ChatResponseTurn,
  TextDocument,
  Range
} from 'vscode';
import * as yaml from 'js-yaml';
import { validateYamlSchema } from '../validation';

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

  try {
    // Determine which command to execute
    const command = request.command || 'general';

    logger.logUsage('chatRequest', {
      command: command,
      promptLength: request.prompt.length,
      hasHistory: context.history.length > 0
    });

    switch (command) {
      case 'new':
        return await handleNewCommand(request, stream, token);
      
      case 'fix':
        return await handleFixCommand(request, context, stream, token);
      
      case 'edit':
        return await handleEditCommand(request, context, stream, token);
      
      case 'general':
      default:
        return await handleGeneralCommand(request, context, stream, token);
    }

  } catch (err) {
    handleError(logger, err, stream);
    return { metadata: { command: request.command || 'error' } };
  }
};

// Extended chat result interface to include metadata
interface IExtendedChatResult extends ChatResult {
  metadata: {
    command: string;
    success?: boolean;
    yamlGenerated?: boolean;
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

/**
 * Get YAML content from user-provided context or active editor
 */
function getYamlContext(request: ChatRequest): {
  yamlFiles: Array<{ uri: string; content: string; name: string; document?: TextDocument }>;
  hasMultipleFiles: boolean;
  primaryYaml: string;
  primaryDocument?: TextDocument;
} {
  const yamlFiles: Array<{ uri: string; content: string; name: string; document?: TextDocument }> = [];
  
  // 1. Check user-provided references (from #file, #selection, etc.)
  for (const reference of request.references) {
    if ('uri' in reference && reference.uri) {
      const uri = reference.uri as Uri;
      const fileName = uri.path.split('/').pop() || '';
      
      // Only process .mql.yml or .mql.yaml files
      if (fileName.endsWith('.mql.yml') || fileName.endsWith('.mql.yaml')) {
        try {
          const document = workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
          if (document) {
            let content = '';
            
            // If it's a selection reference, use only the selected content
            if ('range' in reference && reference.range && Array.isArray(reference.range)) {
              // ChatContext provides range as [start, end] tuple
              const startOffset = reference.range[0];
              const endOffset = reference.range[1];
              content = document.getText().substring(startOffset, endOffset);
            } else {
              content = document.getText();
            }
            
            yamlFiles.push({
              uri: uri.toString(),
              content: content,
              name: fileName,
              document: document
            });
          }
        } catch (err) {
          console.warn('Failed to read referenced file:', err);
        }
      }
    }
  }
  
  // 2. If no references provided, fall back to active editor
  if (yamlFiles.length === 0) {
    const editor = window.activeTextEditor;
    if (editor && (editor.document.fileName.endsWith('.mql.yml') || editor.document.fileName.endsWith('.mql.yaml'))) {
      const fileName = editor.document.fileName.split(/[\\/]/).pop() || '';
      yamlFiles.push({
        uri: editor.document.uri.toString(),
        content: editor.document.getText(),
        name: fileName,
        document: editor.document
      });
    }
  }
  
  return {
    yamlFiles,
    hasMultipleFiles: yamlFiles.length > 1,
    primaryYaml: yamlFiles[0]?.content || '',
    primaryDocument: yamlFiles[0]?.document
  };
}

/**
 * Apply YAML edit directly to document (agent mode)
 */
async function applyYamlEdit(document: TextDocument, yamlContent: string): Promise<boolean> {
  // Use the full document range
  const fullRange = new Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  
  // Create and apply the workspace edit
  const edit = new WorkspaceEdit();
  edit.replace(document.uri, fullRange, yamlContent);
  return await workspace.applyEdit(edit);
}

/**
 * Handle /new command - Generate a new MQL YAML reference
 */
async function handleNewCommand(
  request: ChatRequest,
  stream: ChatResponseStream,
  token: CancellationToken
): Promise<IExtendedChatResult> {
  stream.progress('Generating new MQL YAML reference...');

  const schemaContext = getSchemaContext();
  
  const messages = [
    LanguageModelChatMessage.User(`You are an expert in MongoDB Query Language (MQL) and YAML documentation.

Generate a complete MQL YAML reference document based on this request: "${request.prompt}"

The YAML must conform to this schema structure:
${schemaContext}

Requirements:
- Include all required fields: type, category, name
- Provide clear description and summary
- Include proper syntax examples
- Add at least 2-3 practical examples with queries and outputs
- Ensure all fields are properly formatted

Generate ONLY the YAML content, no additional explanation.`)
  ];

  const response = await request.model.sendRequest(messages, {}, token);
  
  let yamlContent = '';
  for await (const fragment of response.text) {
    yamlContent += fragment;
  }

  // Extract YAML from code blocks if present
  const yamlMatch = yamlContent.match(/```ya?ml\n([\s\S]*?)\n```/);
  const cleanYaml = yamlMatch ? yamlMatch[1] : yamlContent.trim();

  // Validate and let model explain the result
  try {
    const parsed = yaml.load(cleanYaml);
    const validation = validateYamlSchema(parsed);
    
    const explanationMessages = [
      LanguageModelChatMessage.User(`I generated this YAML for the request "${request.prompt}":

\`\`\`yaml
${cleanYaml}
\`\`\`

${validation.valid 
  ? 'The YAML is valid! Explain what you created in a friendly, conversational way.' 
  : `The YAML has validation issues: ${validation.errors?.join(', ')}. Explain the issues and suggest how to fix them.`}`)
    ];
    
    const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
    for await (const fragment of explanationResponse.text) {
      stream.markdown(fragment);
    }

    return { metadata: { command: 'new', success: validation.valid, yamlGenerated: true } };
  } catch (err) {
    stream.markdown(`❌ Failed to parse YAML: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return { metadata: { command: 'new', success: false } };
  }
}

/**
 * Handle /fix command - Fix YAML syntax or validation issues
 */
async function handleFixCommand(
  request: ChatRequest,
  context: ChatContext,
  stream: ChatResponseStream,
  token: CancellationToken
): Promise<IExtendedChatResult> {
  stream.progress('Analyzing YAML for issues...');

  const { yamlFiles, hasMultipleFiles, primaryYaml, primaryDocument } = getYamlContext(request);

  if (!primaryYaml) {
    stream.markdown('⚠️ Please open an MQL YAML file or use `#file` to reference one.');
    return { metadata: { command: 'fix', success: false } };
  }

  if (hasMultipleFiles) {
    stream.markdown(`📁 Found ${yamlFiles.length} YAML files. Fixing the first one: **${yamlFiles[0].name}**\n\n`);
  }

  const yamlContent = primaryYaml;

  // Validate current YAML
  let validationErrors = '';
  try {
    const parsed = yaml.load(yamlContent);
    const validation = validateYamlSchema(parsed);
    
    if (validation.valid) {
      stream.markdown('✅ Your YAML is already valid! No fixes needed.');
      return { metadata: { command: 'fix', success: true } };
    }
    
    validationErrors = validation.errors?.join('\n') || validation.error || '';
  } catch (err) {
    validationErrors = `Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }

  const schemaContext = getSchemaContext();
  
  // Include previous messages for context
  const previousMessages = context.history
    .filter(h => h instanceof ChatRequestTurn)
    .slice(-2)
    .map(turn => (turn as ChatRequestTurn).prompt);
  
  const contextNote = previousMessages.length > 0
    ? `\n**Previous context:** ${previousMessages.join(' ')}\n`
    : '';
  
  const messages = [
    LanguageModelChatMessage.User(`You are an expert in MongoDB Query Language (MQL) YAML documentation.

Fix the following YAML that has validation errors:

**Current YAML:**
\`\`\`yaml
${yamlContent}
\`\`\`

**Validation Errors:**
${validationErrors}

**Schema Requirements:**
${schemaContext}

${request.prompt ? `**User's additional request:** ${request.prompt}\n\n` : ''}${contextNote}

Provide the corrected YAML that:
1. Fixes all validation errors
2. Maintains the original intent and content
3. Follows the schema requirements
4. Uses proper YAML syntax

Return ONLY the corrected YAML, no explanation.`)
  ];

  const response = await request.model.sendRequest(messages, {}, token);
  
  let fixedYaml = '';
  for await (const fragment of response.text) {
    fixedYaml += fragment;
  }

  // Extract YAML from code blocks
  const yamlMatch = fixedYaml.match(/```ya?ml\n([\s\S]*?)\n```/);
  const cleanYaml = yamlMatch ? yamlMatch[1] : fixedYaml.trim();

  // Apply fix and let model explain what was changed
  if (primaryDocument) {
    const success = await applyYamlEdit(primaryDocument, cleanYaml);
    const statusIcon = success ? '✅' : '❌';
    
    const explanationMessages = [
      LanguageModelChatMessage.User(`${statusIcon} I ${success ? 'fixed' : 'attempted to fix'} the YAML validation errors.

Original issues:
${validationErrors}

${success ? 'Explain what you fixed in a natural, conversational way. Be specific about the changes.' : 'Explain that the fix could not be applied to the file.'}`)
    ];
    
    const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
    for await (const fragment of explanationResponse.text) {
      stream.markdown(fragment);
    }
  } else {
    // Fallback: show the fixed YAML with model explanation
    const explanationMessages = [
      LanguageModelChatMessage.User(`I fixed these validation errors:
${validationErrors}

Here's the corrected YAML:
\`\`\`yaml
${cleanYaml}
\`\`\`

Explain what you fixed in a conversational way.`)
    ];
    
    const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
    for await (const fragment of explanationResponse.text) {
      stream.markdown(fragment);
    }
  }

  return { metadata: { command: 'fix', success: true, yamlGenerated: true } };
}

/**
 * Handle /edit command - Copy edit using best practices
 */
async function handleEditCommand(
  request: ChatRequest,
  context: ChatContext,
  stream: ChatResponseStream,
  token: CancellationToken
): Promise<IExtendedChatResult> {
  stream.progress('Copy editing YAML with best practices...');

  const { yamlFiles, hasMultipleFiles, primaryYaml, primaryDocument } = getYamlContext(request);

  if (!primaryYaml) {
    stream.markdown('⚠️ Please open an MQL YAML file or use `#file` to reference one.');
    return { metadata: { command: 'edit', success: false } };
  }

  if (hasMultipleFiles) {
    stream.markdown(`📁 Found ${yamlFiles.length} YAML files. Editing the first one: **${yamlFiles[0].name}**\n\n`);
  }

  const yamlContent = primaryYaml;

  // Include previous messages for context (simplified from tutorial)
  const previousMessages = context.history
    .filter(h => h instanceof ChatRequestTurn)
    .slice(-2)
    .map(turn => (turn as ChatRequestTurn).prompt);
  
  const contextNote = previousMessages.length > 0
    ? `\n**Previous context:** ${previousMessages.join(' ')}\n`
    : '';

  const messages = [
    LanguageModelChatMessage.User(`You are a technical writing expert specializing in MongoDB documentation.

Copy edit and improve this MQL YAML reference documentation following Microsoft Learn best practices:

**Current YAML:**
\`\`\`yaml
${yamlContent}
\`\`\`

**Edit Request:** ${request.prompt || 'Improve clarity, grammar, and technical accuracy'}
${contextNote}

**Best Practices:**
- Use clear, concise language
- Write in active voice
- Use sentence case for descriptions
- Provide meaningful examples
- Ensure technical accuracy
- Include proper explanations
- Use consistent terminology

Return the improved YAML with better documentation quality.`)
  ];

  const response = await request.model.sendRequest(messages, {}, token);
  
  let editedYaml = '';
  for await (const fragment of response.text) {
    editedYaml += fragment;
  }

  const yamlMatch = editedYaml.match(/```ya?ml\n([\s\S]*?)\n```/);
  const cleanYaml = yamlMatch ? yamlMatch[1] : editedYaml.trim();

  // Apply edit and let model explain improvements
  if (primaryDocument) {
    const success = await applyYamlEdit(primaryDocument, cleanYaml);
    const statusIcon = success ? '✅' : '❌';
    
    const explanationMessages = [
      LanguageModelChatMessage.User(`${statusIcon} I ${success ? 'improved' : 'attempted to improve'} the YAML documentation quality.

User's request: ${request.prompt || 'Apply copy editing best practices'}

Explain what improvements you made in a natural, friendly way.`)
    ];
    
    const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
    for await (const fragment of explanationResponse.text) {
      stream.markdown(fragment);
    }
  } else {
    const explanationMessages = [
      LanguageModelChatMessage.User(`I improved this YAML documentation:
\`\`\`yaml
${cleanYaml}
\`\`\`

Explain the improvements you made based on: ${request.prompt || 'copy editing best practices'}`)
    ];
    
    const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
    for await (const fragment of explanationResponse.text) {
      stream.markdown(fragment);
    }
  }

  return { metadata: { command: 'edit', success: true, yamlGenerated: true } };
}

/**
 * Handle general queries about YAML validation, help, examples, etc.
 */
async function handleGeneralCommand(
  request: ChatRequest,
  context: ChatContext,
  stream: ChatResponseStream,
  token: CancellationToken
): Promise<IExtendedChatResult> {
  
  // Analyze user intent
  const prompt = request.prompt.toLowerCase();
  const isValidationQuery = prompt.includes('valid') || prompt.includes('check') || prompt.includes('correct');
  const isHelpQuery = prompt.includes('help') || prompt.includes('how') || prompt === '';
  const isExampleQuery = prompt.includes('example') || prompt.includes('generate example');
  const isFillQuery = prompt.includes('fill') || prompt.includes('add field') || prompt.includes('populate');

  // Get YAML from all available sources
  const { yamlFiles, hasMultipleFiles, primaryYaml } = getYamlContext(request);
  const currentYaml = primaryYaml;
  let yamlData: any = null;
  
  if (currentYaml) {
    try {
      yamlData = yaml.load(currentYaml);
    } catch (err) {
      // Ignore parse errors for now
    }
  }

  // Handle validation queries with model explanation
  if (isValidationQuery && currentYaml) {
    stream.progress('Validating YAML...');
    
    try {
      const parsed = yaml.load(currentYaml);
      const validation = validateYamlSchema(parsed);
      
      const validationMessages = [
        LanguageModelChatMessage.User(`${validation.valid ? '✅' : '❌'} Validation result:

${validation.valid 
  ? 'The YAML is valid and conforms to the schema. Congratulate the user in a friendly way.' 
  : `Found these validation errors:\n${validation.errors?.join('\n')}\n\nExplain the issues clearly and suggest using the /fix command to resolve them.`}`)
      ];
      
      const validationResponse = await request.model.sendRequest(validationMessages, {}, token);
      for await (const fragment of validationResponse.text) {
        stream.markdown(fragment);
      }
      
      if (!validation.valid) {
        stream.button({
          command: 'workbench.action.chat.open',
          title: l10n.t('Fix These Issues'),
          arguments: [{ query: '@mqlyml /fix' }]
        });
      }
      
      return { metadata: { command: 'validate', success: validation.valid } };
    } catch (err) {
      stream.markdown(`❌ YAML parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return { metadata: { command: 'validate', success: false } };
    }
  }

  // Handle help queries with model response
  if (isHelpQuery) {
    const helpMessages = [
      LanguageModelChatMessage.User(`Introduce yourself as the MQL YAML Assistant. Explain in a friendly, conversational way that you help with MongoDB Query Language YAML documentation.

Mention these key capabilities:
- /new command for creating new references
- /fix command for fixing issues
- /edit command for improving quality
- Answering questions about YAML structure
- Generating examples and filling in fields
- Validating documents

Be warm and encouraging!`)
    ];
    
    const helpResponse = await request.model.sendRequest(helpMessages, {}, token);
    for await (const fragment of helpResponse.text) {
      stream.markdown(fragment);
    }
    
    return { metadata: { command: 'help', success: true } };
  }

  // Handle field filling queries
  if (isFillQuery && yamlData) {
    stream.progress('Enhancing YAML fields...');
    
    const { primaryDocument } = getYamlContext(request);
    const schemaContext = getSchemaContext();
    const historyMessages = getHistoryContext(context);
    
    const messages = [
      LanguageModelChatMessage.User(`You are an expert in MongoDB Query Language documentation.

The user wants to improve this MQL YAML reference:

**Current YAML:**
\`\`\`yaml
${currentYaml}
\`\`\`

**User Request:** ${request.prompt}

**Schema Context:**
${schemaContext}

Enhance the YAML by:
1. Filling in missing optional fields if appropriate
2. Improving existing content
3. Adding helpful examples if needed
4. Ensuring technical accuracy

Return the complete enhanced YAML.`),
      ...historyMessages
    ];

    const response = await request.model.sendRequest(messages, {}, token);
    
    let enhancedYaml = '';
    for await (const fragment of response.text) {
      enhancedYaml += fragment;
    }

    const yamlMatch = enhancedYaml.match(/```ya?ml\n([\s\S]*?)\n```/);
    const cleanYaml = yamlMatch ? yamlMatch[1] : enhancedYaml.trim();

    // Apply enhancement and let model explain
    if (primaryDocument) {
      const success = await applyYamlEdit(primaryDocument, cleanYaml);
      const statusIcon = success ? '✅' : '❌';
      
      const explanationMessages = [
        LanguageModelChatMessage.User(`${statusIcon} I ${success ? 'enhanced' : 'attempted to enhance'} the YAML based on: "${request.prompt}"

Explain what you added or improved in a conversational way.`)
      ];
      
      const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
      for await (const fragment of explanationResponse.text) {
        stream.markdown(fragment);
      }
    } else {
      const explanationMessages = [
        LanguageModelChatMessage.User(`I enhanced this YAML:
\`\`\`yaml
${cleanYaml}
\`\`\`

Explain the enhancements you made for: "${request.prompt}"`)
      ];
      
      const explanationResponse = await request.model.sendRequest(explanationMessages, {}, token);
      for await (const fragment of explanationResponse.text) {
        stream.markdown(fragment);
      }
    }

    return { metadata: { command: 'fill', success: true, yamlGenerated: true } };
  }

  // General question handling with context
  stream.progress('Thinking...');
  
  const schemaContext = getSchemaContext();
  const historyMessages = getHistoryContext(context);

  // Build prompt based on context
  let systemPrompt = `You are an expert assistant for MongoDB Query Language (MQL) YAML reference documentation.

**Schema Requirements:**
${schemaContext}

`;
  
  if (hasMultipleFiles) {
    systemPrompt += `The user provided ${yamlFiles.length} MQL YAML files:\n\n`;
    yamlFiles.forEach((file, index) => {
      systemPrompt += `**File ${index + 1}: ${file.name}**\n\`\`\`yaml\n${file.content}\n\`\`\`\n\n`;
    });
  } else if (currentYaml) {
    systemPrompt += `The user is currently editing this MQL YAML file:

\`\`\`yaml
${currentYaml}
\`\`\`

**IMPORTANT:** Use this YAML as the PRIMARY CONTEXT for answering the user's question.

`;
    
    // Add specific guidance for example generation
    if (isExampleQuery) {
      systemPrompt += `The user wants to ADD MORE EXAMPLES to this YAML document. Generate NEW examples that complement the existing ones in the same format.\n\n`;
    }
  }
  
  systemPrompt += `Provide your response based on the user's question: "${request.prompt}"`;
  
  if (currentYaml) {
    systemPrompt += `\n\nIf generating new examples or content, provide them in YAML format within a code block.`;
  }
  
  const messages = [
    LanguageModelChatMessage.User(systemPrompt),
    ...historyMessages
  ];

  const response = await request.model.sendRequest(messages, {}, token);
  
  let fullResponse = '';
  for await (const fragment of response.text) {
    stream.markdown(fragment);
    fullResponse += fragment;
  }

  // Check if YAML was generated in response
  const hasYaml = fullResponse.includes('```yaml') || fullResponse.includes('```yml');

  return { metadata: { command: 'general', success: true, yamlGenerated: hasYaml } };
}

/**
 * Get schema context for the language model
 */
function getSchemaContext(): string {
  return `The MQL YAML schema requires:
- **type**: "operator" or "command" (required)
- **category**: Category of the operator/command (required)
- **name**: Official name (required)
- **description**: Detailed explanation (optional)
- **summary**: Concise summary (optional)
- **syntax**: Canonical syntax (optional)
- **parameters**: Array of parameter objects with name, type, required, description (optional)
- **examples**: Object with optional 'sample' and required 'items' array (optional)
  - Each example needs: title, description, query, optional output
- **related**: Array of related references, max 4 items (optional)`;
}

/**
 * Get chat history context (simplified from tutorial)
 */
function getHistoryContext(context: ChatContext): LanguageModelChatMessage[] {
  const history: LanguageModelChatMessage[] = [];
  
  // Get previous request turns and add them as User messages
  const previousRequests = context.history
    .filter(h => h instanceof ChatRequestTurn)
    .slice(-3); // Last 3 requests
  
  for (const turn of previousRequests) {
    if (turn instanceof ChatRequestTurn) {
      history.push(LanguageModelChatMessage.User(turn.prompt));
    }
  }
  
  return history;
}

// making the chat request might fail because
// - model does not exist
// - user consent not given
// - quote limits exceeded
function handleError(logger: ReturnType<typeof env.createTelemetryLogger>, err: unknown, stream: ChatResponseStream): void {
  if (err instanceof Error) {
    logger.logError(err);
  }
  if (err instanceof LanguageModelError) {
    console.log(err.message, err.code);
    stream.markdown(l10n.t('❌ I encountered an error processing your request. Please try again.'));
  } else {
    // re-throw other errors so they show up in the UI
    throw err;
  }
}