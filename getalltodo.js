import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async () => {
    try {
        const tasks = await getAllTasks();
        const result = formatTasks(tasks);

        return successResponse(result);
    } catch (err) {
        console.error(err);
        return errorResponse(err.message);
    }
};

const getAllTasks = async () => {
    const params = { TableName: 'to-do_table' };
    const command = new ScanCommand(params);
    const data = await ddbClient.send(command);
    return data.Items;
};

const formatTasks = (tasks) => {
    return tasks.map(item => ({
        Title: item.Title.S,
        todoId: item["todo id"].S,
        IsComplete: item.IsComplete.BOOL,
        CreatedAt: item.CreatedAt.S,
    }));
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

const errorResponse = (errorMessage) => {
    return {
        statusCode: 500,
        body: JSON.stringify({ Error: errorMessage }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
};
