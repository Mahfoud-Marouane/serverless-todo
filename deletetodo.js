import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
    try {
        const todoId = extractTodoId(event);

        if (!todoId) {
            throw new Error("todoId is required");
        }

        await deleteTaskById(todoId);

        return successResponse(`Task with id ${todoId} deleted successfully`);
    } catch (err) {
        console.error(err);
        return errorResponse(err.message, event.requestContext.requestId);
    }
};

const extractTodoId = (event) => {
    let todoId;
    if (event.body) {
        const requestBody = JSON.parse(event.body);
        todoId = requestBody.todoId;
    } else {
        todoId = event.todoId;
    }
    return todoId;
};

const deleteTaskById = async (todoId) => {
    const params = {
        TableName: 'to-do_table',
        Key: {
            "todo id": { S: todoId.toString() },
        },
    };
    const command = new DeleteItemCommand(params);
    await ddbClient.send(command);
};

const successResponse = (message) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message }),
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
