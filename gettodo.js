import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
    try {
        const todoId = extractTodoId(event);

        if (!todoId) {
            throw new Error("todoId is required");
        }

        const task = await getTaskById(todoId);

        if (!task) {
            return notFoundResponse(`Task with id ${todoId} not found`);
        }

        return successResponse(formatTask(task));
    } catch (err) {
        console.error(err);
        return errorResponse(err.message, event.requestContext?.requestId);
    }
};

const extractTodoId = (event) => {
    if (event.body) {
        const requestBody = JSON.parse(event.body);
        return requestBody.todoId;
    }
    return event.todoId;
};

const getTaskById = async (todoId) => {
    const params = {
        TableName: 'to-do_table',
        Key: {
            "todo id": { S: todoId.toString() },
        },
    };
    const command = new GetItemCommand(params);
    const data = await ddbClient.send(command);
    return data.Item;
};

const formatTask = (task) => {
    return {
        Title: task.Title.S,
        todoId: task.todoId.S,
        IsComplete: task.IsComplete.BOOL,
        CreatedAt: task.CreatedAt.S,
    };
};

const successResponse = (body) => {
    return {
        statusCode: 200,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
};

const notFoundResponse = (message) => {
    return {
        statusCode: 404,
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

