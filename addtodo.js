
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from 'crypto';

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
    let todoId;
    let title;

    try {
        todoId = generateNumericUUID();
        console.log('Received event (', todoId.toString(), '): ', event);

        // Parse the event body to extract the title
        const requestBody = JSON.parse(event.body);
        title = requestBody.title;

        if (!title) {
            throw new Error("Title is required");
        }

        await recordTodo(todoId, title, false);

        return {
            statusCode: 201,
            body: JSON.stringify({
                todoId: todoId.toString(),
                Title: title,
                CreatedAt: new Date().toISOString(),
                IsComplete: false,  
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (err) {
        console.error(err);
        return errorResponse(err.message, event.requestContext.requestId);
    }
};

const recordTodo = async (todoId, title, isComplete) => {
    const params = {
        TableName: 'to-do_table',
        Item: {
            "todo id": { S: todoId.toString() },
            Title: { S: title },
            CreatedAt: { S: new Date().toISOString() },
            IsComplete: { BOOL: isComplete },
        },
    };
    const command = new PutItemCommand(params);
    await ddbClient.send(command);
};

const generateNumericUUID = () => {
    const uuid = randomUUID().replace(/-/g, '');
    const numericUuid = parseInt(uuid.slice(0, 12), 16);
    return numericUuid;
};

const errorResponse = (errorMessage, awsRequestId) => {
    return {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
    },
};
};