import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
    try {
        const { todoId, isComplete } = extractRequestBody(event.body);

        if (!todoId || isComplete === undefined) {
            throw new Error("todoId and isComplete are required");
        }

        await updateTaskStatus(todoId, isComplete);

        return successResponse(`Task with id ${todoId} updated successfully`, isComplete);
    } catch (err) {
        console.error(err);
        return errorResponse(err.message, event.requestContext?.requestId);
    }
};

const extractRequestBody = (body) => {
    const requestBody = JSON.parse(body);
    return {
        todoId: requestBody.todoId,
        isComplete: requestBody.isComplete,
    };
};

const updateTaskStatus = async (todoId, isComplete) => {
    const params = {
        TableName: 'to-do_table',
        Key: {
            "todo id": { S: todoId.toString() },
        },
        UpdateExpression: 'SET IsComplete = :isComplete',
        ExpressionAttributeValues: {
            ':isComplete': { BOOL: isComplete },
        },
    };
    const command = new UpdateItemCommand(params);
    await ddbClient.send(command);
};

const successResponse = (message, isComplete) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message,
            isComplete,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
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
